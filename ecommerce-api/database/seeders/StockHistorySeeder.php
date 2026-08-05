<?php

namespace Database\Seeders;

use App\Models\StockHistory;
use Illuminate\Database\Seeder;

class StockHistorySeeder extends Seeder
{
    public function run(): void
    {
        StockHistory::factory(300)->create();
    }
}
