<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    public function definition(): array
    {
        return [

            'user_id' => User::inRandomOrder()->value('id'),

            'title' => fake()->randomElement([
                'Siparişiniz Alındı',
                'Kargonuz Yola Çıktı',
                'Ürün Teslim Edildi',
                'Yeni Kampanya'
            ]),

            'message' => fake()->sentence(),

            'type' => fake()->randomElement([
                'order',
                'campaign',
                'system'
            ]),

            'is_read' => fake()->boolean()

        ];
    }
}
