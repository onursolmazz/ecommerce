import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import getImageUrl from "../utils/getImageUrl";

import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
};

const formatPrice = (
  value: number | string | null | undefined,
): string => {
  const price = Number(value ?? 0);

  if (!Number.isFinite(price)) {
    return "₺0,00";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const ProductCard = ({
  product,
}: ProductCardProps) => {
  const imageUrl = getImageUrl(product);

  const rating = Number(
    product.average_rating ??
      product.reviews_avg_rating ??
      product.rating ??
      0,
  );

  const stock = Number(product.stock ?? 0);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>
              ▧
            </Text>

            <Text style={styles.placeholderText}>
              Görsel yok
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {product.category?.name ? (
          <Text
            style={styles.category}
            numberOfLines={1}
          >
            {product.category.name}
          </Text>
        ) : null}

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {product.name || "Ürün"}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.rating}>
            ★{" "}
            {Number.isFinite(rating)
              ? rating.toFixed(1)
              : "0.0"}
          </Text>

          <Text
            style={[
              styles.stock,
              stock <= 0 && styles.outOfStock,
            ]}
          >
            {stock > 0 ? `${stock} stok` : "Tükendi"}
          </Text>
        </View>

        <Text style={styles.price}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
  },

  image: {
    width: "90%",
    height: "90%",
  },

  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  placeholderIcon: {
    color: "#f97316",
    fontSize: 32,
  },

  placeholderText: {
    color: "#9ca3af",
    fontSize: 12,
  },

  content: {
    padding: 13,
  },

  category: {
    marginBottom: 5,
    color: "#f97316",
    fontSize: 11,
    fontWeight: "700",
  },

  name: {
    minHeight: 40,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 9,
  },

  rating: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "700",
  },

  stock: {
    color: "#16a34a",
    fontSize: 10,
    fontWeight: "600",
  },

  outOfStock: {
    color: "#dc2626",
  },

  price: {
    marginTop: 12,
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default ProductCard;