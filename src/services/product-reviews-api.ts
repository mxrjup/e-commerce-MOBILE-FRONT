import type { createApiClient } from './api-client';

export type ReviewInput = { rating: number; comment: string };

export type ProductReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewPage = {
  reviews: ProductReview[];
  averageRating: number | null;
  totalReviews: number;
  page: number;
  size: number;
  hasNext: boolean;
};

export const reviewCommentLimit = 2000;

export function createProductReviewsApi(client: Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>) {
  function path(slug: string) {
    if (!slug.trim() || slug === '.' || slug === '..') throw new Error('Produit invalide.');
    return `/api/catalog/products/${encodeURIComponent(slug)}/reviews`;
  }

  return {
    async list(slug: string, page: number) {
      return client.get<ProductReviewPage>(`${path(slug)}?page=${page}&size=20`, { auth: false });
    },
    async save(slug: string, review: ReviewInput) {
      return client.post<ProductReview>(path(slug), { rating: review.rating, comment: review.comment.trim() });
    },
  };
}
