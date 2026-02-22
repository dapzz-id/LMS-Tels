<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpeg,jpg,png,webp,gif|mimetypes:application/pdf,image/jpeg,image/png,image/webp,image/gif',
        ], [
            'file.required' => 'File wajib diunggah.',
            'file.file' => 'File tidak valid.',
            'file.max' => 'Ukuran file maksimal 10 MB.',
            'file.mimes' => 'Format file harus PDF atau gambar (JPEG/PNG/WEBP/GIF).',
        ]);

        $file = $request->file('file');
        $mime = $file?->getMimeType();

        if ($file === null || $mime === null) {
            return response()->json([
                'status' => 'error',
                'message' => 'File tidak valid.',
            ], 422);
        }

        try {
            $stored = str_starts_with($mime, 'image/')
                ? $this->storeImageWithoutMetadata($file, 'uploads/images')
                : $this->storePdf($file, 'uploads/pdfs');

            return response()->json([
                'status' => 'success',
                'message' => 'File berhasil diunggah.',
                'url' => $stored['url'],
                'filename' => $stored['filename'],
                'mime_type' => $stored['mime_type'],
                'size' => $stored['size'],
            ]);
        } catch (RuntimeException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 422);
        } catch (\Throwable $exception) {
            Log::error('Admin file upload failed', [
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Upload file gagal. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * @return array{path:string,url:string,filename:string,mime_type:string,size:int}
     */
    private function storePdf($file, string $directory): array
    {
        $filename = sprintf('%s_%s.pdf', now()->format('YmdHis'), Str::random(8));
        $path = $file->storeAs($directory, $filename, 'public');

        return [
            'path' => $path,
            'url' => '/storage/'.ltrim($path, '/'),
            'filename' => $filename,
            'mime_type' => $file->getMimeType() ?? 'application/pdf',
            'size' => $file->getSize() ?: 0,
        ];
    }

    /**
     * @return array{path:string,url:string,filename:string,mime_type:string,size:int}
     */
    private function storeImageWithoutMetadata($file, string $directory): array
    {
        $binary = file_get_contents($file->getRealPath());
        if ($binary === false) {
            throw new RuntimeException('Gagal membaca file gambar.');
        }

        $imageInfo = @getimagesizefromstring($binary);
        $mime = $imageInfo['mime'] ?? null;

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];

        if (!$mime || !array_key_exists($mime, $allowedMimes)) {
            throw new RuntimeException('Format gambar tidak didukung.');
        }

        $imageResource = @imagecreatefromstring($binary);
        if ($imageResource === false) {
            throw new RuntimeException('File gambar tidak valid.');
        }

        $extension = $allowedMimes[$mime];
        $filename = sprintf('%s_%s.%s', now()->format('YmdHis'), Str::random(8), $extension);

        $tempPath = tempnam(sys_get_temp_dir(), 'img_');
        if ($tempPath === false) {
            imagedestroy($imageResource);
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $outputPath = $tempPath.'.'.$extension;
        @rename($tempPath, $outputPath);

        $written = match ($mime) {
            'image/jpeg' => imagejpeg($imageResource, $outputPath, 85),
            'image/png' => imagepng($imageResource, $outputPath, 6),
            'image/gif' => imagegif($imageResource, $outputPath),
            'image/webp' => function_exists('imagewebp')
                ? imagewebp($imageResource, $outputPath, 85)
                : false,
            default => false,
        };

        imagedestroy($imageResource);

        if ($written === false) {
            @unlink($outputPath);
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $storedBinary = file_get_contents($outputPath);
        @unlink($outputPath);

        if ($storedBinary === false) {
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $path = trim($directory, '/').'/'.$filename;
        $stored = Storage::disk('public')->put($path, $storedBinary);

        if (!$stored) {
            throw new RuntimeException('Gagal menyimpan file gambar.');
        }

        return [
            'path' => $path,
            'url' => '/storage/'.ltrim($path, '/'),
            'filename' => $filename,
            'mime_type' => $mime,
            'size' => Storage::disk('public')->size($path),
        ];
    }
}
