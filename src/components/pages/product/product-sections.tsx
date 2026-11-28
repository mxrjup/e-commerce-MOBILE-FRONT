import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ControlSize, LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, getApiErrorMessage } from '@/services/api-client';
import { createProductReviewsApi, reviewCommentLimit, type ProductReviewPage, type ReviewInput } from '@/services/product-reviews-api';
import { unavailableAccessories } from './product-logic';

const ratings = [1, 2, 3, 4, 5];
const ratingFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function Stars({ rating }: { rating: number }) {
  return <ThemedText themeColor="accent" accessibilityLabel={`${ratingFormat.format(rating)} sur 5`}>
    {ratings.map(star => star <= Math.round(rating) ? '★' : '☆').join('')}
  </ThemedText>;
}

export function ProductSection({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.section, { borderTopColor: theme.border }]}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>{title}</ThemedText>
    {children}
  </View>;
}

export function ProductReviews({ slug }: { slug: string }) {
  const client = useApi();
  const api = useMemo(() => createProductReviewsApi(client), [client]);
  const { ready, user } = useAuth();
  const theme = useTheme();
  const [request, setRequest] = useState({ page: 0 });
  const [state, setState] = useState<{ request: typeof request; data?: ProductReviewPage; error?: string }>();

  useEffect(() => {
    let active = true;
    api.list(slug, request.page).then(data => {
      if (active) setState({ request, data });
    }).catch(cause => {
      if (active) setState({ request, error: getApiErrorMessage(cause) });
    });
    return () => { active = false; };
  }, [api, request, slug]);

  const current = state?.request === request ? state : undefined;
  const data = current?.data;
  return <ProductSection title="Avis clients">
    {!current && <View style={styles.row} accessibilityLiveRegion="polite">
      <ActivityIndicator color={theme.accent} />
      <ThemedText>Chargement des avis…</ThemedText>
    </View>}
    {current?.error && <>
      <ThemedText accessibilityRole="alert" themeColor="danger">{current.error}</ThemedText>
      <Choice label="Réessayer" onPress={() => setRequest({ page: request.page })} />
      {request.page > 0 && <Choice label="Revenir aux premiers avis" onPress={() => setRequest({ page: 0 })} />}
    </>}
    {data && <>
      {data.averageRating !== null && <View style={styles.row}>
        <Stars rating={data.averageRating} />
        <ThemedText style={LoginTypography.button}>{ratingFormat.format(data.averageRating)} / 5</ThemedText>
      </View>}
      <ThemedText themeColor="textSecondary">{data.totalReviews} avis</ThemedText>
      {data.totalReviews === 0 && <ThemedText>Aucun avis pour ce produit.</ThemedText>}
      {data.reviews.map(review => <View key={review.id} style={[styles.review, { borderColor: theme.border }]}>
        <View style={styles.row}>
          <Stars rating={review.rating} />
          <ThemedText themeColor="textSecondary">{dateFormat.format(new Date(review.createdAt))}</ThemedText>
        </View>
        {review.comment && <ThemedText>{review.comment}</ThemedText>}
      </View>)}
      <View style={styles.row}>
        {data.page > 0 && <Choice label="Avis précédents" onPress={() => setRequest({ page: data.page - 1 })} />}
        {data.hasNext && <Choice label="Avis suivants" onPress={() => setRequest({ page: data.page + 1 })} />}
        <Choice label="Actualiser les avis" onPress={() => setRequest({ page: 0 })} />
      </View>
    </>}
    {user ? <ReviewForm key={user.sub} onSave={async review => {
      const saved = await api.save(slug, review);
      setRequest({ page: 0 });
      return saved;
    }} /> : ready && <ThemedText themeColor="textSecondary">Connectez-vous pour donner votre avis.</ThemedText>}
  </ProductSection>;
}

function ReviewForm({ onSave }: { onSave: (review: ReviewInput) => Promise<{ rating: number; comment: string | null }> }) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const review = await onSave({ rating, comment });
      setRating(review.rating);
      setComment(review.comment ?? '');
      setSaved(true);
      setMessage('Votre avis a été enregistré.');
    } catch (cause) {
      setMessage(cause instanceof ApiError && cause.status === 401
        ? 'Reconnectez-vous pour enregistrer votre avis.'
        : `Votre avis n’a pas pu être enregistré. ${getApiErrorMessage(cause)}`);
    } finally {
      setSaving(false);
    }
  }

  return <View style={[styles.review, { borderColor: theme.border }]}>
    <ThemedText style={LoginTypography.button}>Votre avis</ThemedText>
    <View style={styles.row}>{ratings.map(star => <Pressable key={star} accessibilityRole="button"
      accessibilityLabel={`${star} ${star === 1 ? 'étoile' : 'étoiles'} sur 5`}
      accessibilityState={{ selected: star === rating, disabled: saving }} disabled={saving}
      onPress={() => { setRating(star); setMessage(''); }} style={styles.starButton}>
      <ThemedText themeColor="accent" style={styles.star}>{star <= rating ? '★' : '☆'}</ThemedText>
    </Pressable>)}</View>
    <ThemedText>Commentaire</ThemedText>
    <TextInput accessibilityLabel="Commentaire" value={comment}
      onChangeText={text => { setComment(text); setMessage(''); }} multiline maxLength={reviewCommentLimit} editable={!saving}
      style={[LoginTypography.body, styles.input, { borderColor: theme.borderStrong, color: theme.text }]} />
    <ThemedText themeColor="textSecondary">{comment.length} / {reviewCommentLimit}</ThemedText>
    <Choice label={saving ? 'Enregistrement…' : saved ? 'Mettre à jour mon avis' : 'Enregistrer mon avis'}
      onPress={save} disabled={saving || rating === 0 || !comment.trim() || comment.length > reviewCommentLimit} />
    {!!message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
  </View>;
}

export function ProductAccessories() {
  return <ProductSection title="Accessoires associés"><ThemedText themeColor="textSecondary">{unavailableAccessories}</ThemedText></ProductSection>;
}

const styles = StyleSheet.create({
  section: { borderTopWidth: 1, paddingTop: Spacing.four, gap: Spacing.small },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
  review: { borderTopWidth: 1, paddingTop: Spacing.small, gap: Spacing.two },
  starButton: { minWidth: ControlSize.touch, minHeight: ControlSize.touch, justifyContent: 'center', alignItems: 'center' },
  star: { fontSize: 26, lineHeight: 30 },
  input: { borderWidth: 1, borderRadius: Radius.control, padding: Spacing.small, minHeight: 96, textAlignVertical: 'top' },
});
