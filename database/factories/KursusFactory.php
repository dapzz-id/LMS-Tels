<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kursus>
 */
class KursusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_mapel' => \App\Models\Mapel::factory(),
            'judul_kursus' => fake()->sentence(),
            'deskripsi_kursus' => fake()->paragraph(),
            'url_thumbnail' => fake()->imageUrl(),
        ];
    }
}
