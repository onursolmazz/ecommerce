<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(3, true);

        return [
            'category_id' => Category::inRandomOrder()->first()->id,
            'seller_id'   => User::where('role_id', 2)->inRandomOrder()->first()->id,
            'name' => ucfirst($name),
            'slug' => Str::slug($name) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(5),
            'price' => fake()->numberBetween(100, 15000),
            'stock' => fake()->numberBetween(0, 200),
            'status' => true,
            'is_featured' => fake()->boolean(20),
            'is_popular' => fake()->boolean(30),
            'view_count' => fake()->numberBetween(0, 5000),
            'sales_count' => fake()->numberBetween(0, 1000),
        ];
    }
}
