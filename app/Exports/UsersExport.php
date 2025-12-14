<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return User::select([
            'nama_lengkap',
            'username',
            'email',
            'tipe_user',
            'class',
            'created_at'
        ])->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Nama Lengkap',
            'Username',
            'Email',
            'Tipe User',
            'Class',
            'Tanggal Dibuat'
        ];
    }

    /**
     * @param mixed $row
     *
     * @return array
     */
    public function map($row): array
    {
        return [
            $row->nama_lengkap,
            $row->username,
            $row->email,
            ucfirst($row->tipe_user),
            $row->class ?? '',
            $row->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
