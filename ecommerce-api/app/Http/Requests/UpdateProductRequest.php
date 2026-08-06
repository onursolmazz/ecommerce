<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],

            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products')->ignore($this->product)
            ],

            'description' => ['nullable', 'string'],

            'price' => ['required', 'numeric', 'min:0'],

            'stock' => ['required', 'integer', 'min:0'],

            'status' => ['boolean'],

            'images.*' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ],
            'deleted_images' => ['nullable', 'array'],
            'deleted_images.*' => ['exists:product_images,id'],
            'primary_image_id' => ['nullable', 'exists:product_images,id'],
        ];
    }
}
