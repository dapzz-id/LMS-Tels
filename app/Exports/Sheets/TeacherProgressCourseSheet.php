<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class TeacherProgressCourseSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
{
    public function __construct(
        private readonly string $sheetTitle,
        private readonly array $rows
    ) {
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Siswa',
            'Email',
            'Kelas',
            'Progress (%)',
            'Status',
            'Konten Selesai',
            'Total Konten',
            'Tanggal Enroll',
            'Aktivitas Terakhir',
            'Tanggal Selesai',
        ];
    }

    public function title(): string
    {
        return $this->sheetTitle;
    }
}
