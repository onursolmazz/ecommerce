<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'category_id',
        'seller_id',
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'status',
        'is_featured',
        'is_popular',
        'view_count',
        'sales_count',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function stockHistories()
    {
        return $this->hasMany(StockHistory::class);
    }
}
