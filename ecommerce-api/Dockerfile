FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libzip-dev \
    libonig-dev \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-progress

RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache

RUN php artisan config:clear || true
RUN php artisan route:clear || true
RUN php artisan view:clear || true

CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && (php artisan storage:link || true) && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]