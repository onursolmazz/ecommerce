<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::where('role_id', 3)->inRandomOrder()->value('id'),

            'total_price' => fake()->numberBetween(500, 50000),

            'status' => fake()->randomElement([
                'pending',
                'preparing',
                'shipped',
                'delivered',
                'cancelled'
            ]),
        ];
    }
}
