<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class TeacherProgressSummarySheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
{
    public function __construct(
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
            'Total Course',
            'Rata-rata Progress (%)',
            'Course Selesai',
            'Course Berjalan',
            'Course Belum Mulai',
            'Aktivitas Terakhir',
        ];
    }

    public function title(): string
    {
        return 'Ringkasan';
    }
}
