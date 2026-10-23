import 'package:flutter/material.dart';
import '../../../../core/theme/zoodi_theme.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _selectedVariantIndex = 0;
  String _selectedSize = 'M';
  int _currentImageIndex = 0;

  // Real multi-color jacket variants matching specifications
  final List<Map<String, dynamic>> _variants = [
    {
      'id': 'var_jk_red',
      'colorName': 'Crimson Red',
      'colorCode': 0xFFD91E36,
      'sku': 'ZD-JKT-RED-01',
      'price': 149.0,
      'stock': 24,
      'images': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      ],
      'sizes': {'S': 5, 'M': 8, 'L': 7, 'XL': 4},
    },
    {
      'id': 'var_jk_yellow',
      'colorName': 'Golden Mustard',
      'colorCode': 0xFFFFB000,
      'sku': 'ZD-JKT-YEL-02',
      'price': 149.0,
      'stock': 18,
      'images': [
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80',
      ],
      'sizes': {'S': 3, 'M': 6, 'L': 6, 'XL': 3},
    },
    {
      'id': 'var_jk_black',
      'colorName': 'Midnight Black',
      'colorCode': 0xFF192E4D,
      'sku': 'ZD-JKT-BLK-03',
      'price': 159.0,
      'stock': 35,
      'images': [
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80',
      ],
      'sizes': {'S': 8, 'M': 12, 'L': 10, 'XL': 5},
    },
  ];

  @override
  Widget build(BuildContext context) {
    final activeVariant = _variants[_selectedVariantIndex];
    final List<String> images = List<String>.from(activeVariant['images']);
    final Map<String, int> sizeStock = Map<String, int>.from(activeVariant['sizes']);
    final currentStock = sizeStock[_selectedSize] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('ZOODI Collection'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.favorite_border)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined)),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gallery
            SizedBox(
              height: 380,
              child: PageView.builder(
                itemCount: images.length,
                onPageChanged: (idx) => setState(() => _currentImageIndex = idx),
                itemBuilder: (ctx, idx) => Image.network(images[idx], fit: BoxFit.cover),
              ),
            ),
            // Variant Color Swatches
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Color: ${activeVariant['colorName']}',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(_variants.length, (idx) {
                      final v = _variants[idx];
                      final isSelected = idx == _selectedVariantIndex;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedVariantIndex = idx;
                            _currentImageIndex = 0;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.override(
                              border: Border.all(
                                color: isSelected ? ZoodiColors.primaryTeal : Colors.transparent,
                                width: 2,
                              ),
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 16,
                            backgroundColor: Color(v['colorCode']),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Size: $_selectedSize (${currentStock > 0 ? "$currentStock in stock" : "Sold Out"})',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: ['S', 'M', 'L', 'XL'].map((s) {
                      final isSelected = s == _selectedSize;
                      final isAvailable = (sizeStock[s] ?? 0) > 0;
                      return GestureDetector(
                        onTap: isAvailable ? () => setState(() => _selectedSize = s) : null,
                        child: Container(
                          margin: const EdgeInsets.only(right: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? ZoodiColors.primaryTeal : (isAvailable ? Colors.white : Colors.grey.shade100),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSelected ? ZoodiColors.primaryTeal : (isAvailable ? ZoodiColors.borders : Colors.grey.shade300),
                            ),
                          ),
                          child: Text(
                            s,
                            style: TextStyle(
                              color: isSelected ? Colors.white : (isAvailable ? ZoodiColors.primaryText : Colors.grey),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: ZoodiColors.borders)),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: ZoodiColors.primaryTeal),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Add to Cart', style: TextStyle(color: ZoodiColors.primaryTeal, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: ZoodiColors.primaryTeal,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Buy Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
