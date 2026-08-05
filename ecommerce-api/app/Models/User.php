<?php

namespace App\Models;;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'role_id',
        'name',
        'email',
        'phone',
        'password',
        'status'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    public function stockHistories()
    {
        return $this->hasMany(StockHistory::class);
    }
}
