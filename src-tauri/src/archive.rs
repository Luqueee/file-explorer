use std::fs::File;
use std::io::BufWriter;
use std::path::{Path, PathBuf};
use std::thread;

use crate::path_safety::{ensure_within, reject_traversal, validate_filename};

const ZSTD_LEVEL: i32 = 3;

fn workers() -> u32 {
    thread::available_parallelism()
        .map(|n| n.get() as u32)
        .unwrap_or(1)
}

fn unique_dest(base: &Path) -> PathBuf {
    if !base.exists() {
        return base.to_path_buf();
    }
    let parent = base.parent().unwrap_or(Path::new("."));
    let stem = base.file_name().and_then(|n| n.to_str()).unwrap_or("archive");
    for i in 1..1000 {
        let candidate = parent.join(format!("{} ({})", stem, i));
        if !candidate.exists() {
            return candidate;
        }
    }
    base.to_path_buf()
}

/// Compress one or more entries into a single archive in `dest_dir`.
/// Single regular file → `<name>.zst` (raw zstd, no tar wrapper).
/// Otherwise → `<archive_name>.tar.zst` with tar streaming through zstd.
#[tauri::command]
pub fn compress_entries(
    paths: Vec<String>,
    dest_dir: String,
    archive_name: Option<String>,
) -> Result<String, String> {
    if paths.is_empty() {
        return Err("Sin archivos para comprimir".into());
    }
    let dest = Path::new(&dest_dir);
    reject_traversal(dest)?;
    if !dest.is_dir() {
        return Err("Destino inválido".into());
    }

    let sources: Vec<PathBuf> = paths.iter().map(PathBuf::from).collect();
    for s in &sources {
        reject_traversal(s)?;
        if !s.exists() {
            return Err(format!("No existe: {}", s.display()));
        }
    }

    let single_file = sources.len() == 1 && sources[0].is_file();

    let out_path = if single_file {
        let src = &sources[0];
        let name = src
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or("Nombre inválido")?;
        let target = format!("{}.zst", name);
        validate_filename(&target)?;
        unique_dest(&dest.join(target))
    } else {
        let base = archive_name.unwrap_or_else(|| {
            sources[0]
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("archive")
                .to_string()
        });
        validate_filename(&base)?;
        let target = format!("{}.tar.zst", base);
        unique_dest(&dest.join(target))
    };

    ensure_within(dest, &out_path)?;

    let file = File::create(&out_path).map_err(|e| e.to_string())?;
    let writer = BufWriter::with_capacity(1 << 20, file);
    let mut encoder = zstd::stream::Encoder::new(writer, ZSTD_LEVEL).map_err(|e| e.to_string())?;
    encoder
        .multithread(workers())
        .map_err(|e| e.to_string())?;
    encoder.include_checksum(true).map_err(|e| e.to_string())?;

    if single_file {
        let mut input = File::open(&sources[0]).map_err(|e| e.to_string())?;
        std::io::copy(&mut input, &mut encoder).map_err(|e| e.to_string())?;
    } else {
        let mut tar = tar::Builder::new(&mut encoder);
        tar.follow_symlinks(false);
        for src in &sources {
            let name = src
                .file_name()
                .and_then(|n| n.to_str())
                .ok_or("Nombre inválido")?;
            if src.is_dir() {
                tar.append_dir_all(name, src).map_err(|e| e.to_string())?;
            } else {
                tar.append_path_with_name(src, name)
                    .map_err(|e| e.to_string())?;
            }
        }
        tar.finish().map_err(|e| e.to_string())?;
    }

    let writer = encoder.finish().map_err(|e| e.to_string())?;
    writer.into_inner().map_err(|e| e.to_string())?;

    Ok(out_path.to_string_lossy().to_string())
}
