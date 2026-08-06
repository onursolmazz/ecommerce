<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'seller_id'   => ['required', 'exists:users,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:products,name'
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'price' => [
                'required',
                'numeric',
                'min:0'
            ],
            'stock' => [
                'required',
                'integer',
                'min:0'
            ],
            'status' => [
                'boolean'
            ],
            'is_featured' => [
                'boolean'
            ],
            'is_popular' => [
                'boolean'
            ],
            'images' => [
                'nullable',
                'array'
            ],
            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori seçiniz.',
            'category_id.exists' => 'Kategori bulunamadı.',
            'seller_id.required' => 'Satıcı seçiniz.',
            'seller_id.exists' => 'Satıcı bulunamadı.',
            'name.required' => 'Ürün adı zorunludur.',
            'name.unique' => 'Bu ürün zaten mevcut.',
            'price.required' => 'Fiyat zorunludur.',
            'price.numeric' => 'Fiyat sayı olmalıdır.',
            'stock.required' => 'Stok zorunludur.',
            'stock.integer' => 'Stok tam sayı olmalıdır.',
            'images.*.image' => 'Dosya resim olmalıdır.',
            'images.*.mimes' => 'Sadece jpg, jpeg, png ve webp yükleyebilirsiniz.',
            'images.*.max' => 'Her resim en fazla 2 MB olabilir.',
        ];
    }
}
