import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clampZoom } from './product-logic';

function ProductImage({ uri, label }: { uri: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <View style={styles.empty}><ThemedText>Image indisponible</ThemedText></View>
    : <Image source={{ uri }} accessibilityLabel={label} accessible contentFit="contain" style={styles.fill} onError={() => setFailed(true)} />;
}

function ZoomImage({ uri, title }: { uri: string; title: string }) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [gesture] = useState(() => {
    let current = { scale: 1, x: 0, y: 0 };
    let origin = { distance: 0, scale: 1, x: 0, y: 0, touchX: 0, touchY: 0, count: 0 };
    let bounds = { width: 0, height: 0 };
    function update(scale: number, x = current.x, y = current.y) {
      const nextScale = clampZoom(scale);
      const maxX = bounds.width * (nextScale - 1) / 2;
      const maxY = bounds.height * (nextScale - 1) / 2;
      const next = { scale: nextScale, x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
      current = next;
      setTransform(next);
    }
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { origin.count = 0; },
      onPanResponderMove: event => {
        const touches = event.nativeEvent.touches;
        if (!touches.length) return;
        const a = touches[0];
        const b = touches[1];
        const distance = b ? Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY) : 0;
        if (origin.count !== touches.length) {
          origin = { ...current, distance, touchX: a.pageX, touchY: a.pageY, count: touches.length };
          return;
        }
        const start = origin;
        if (b && start.distance > 0) update(start.scale * distance / start.distance);
        else update(current.scale, start.x + a.pageX - start.touchX, start.y + a.pageY - start.touchY);
      },
      onPanResponderRelease: () => { origin.count = 0; },
      onPanResponderTerminate: () => { origin.count = 0; },
    });
    return { responder, update, setBounds: (size: { width: number; height: number }) => { bounds = size; update(current.scale); } };
  });
  return <>
    <ThemedText>Pincez pour zoomer, puis faites glisser l’image.</ThemedText>
    <View style={styles.viewport} onLayout={e => { gesture.setBounds(e.nativeEvent.layout); }} {...gesture.responder.panHandlers}>
      <View style={[styles.fill, { transform: [{ translateX: transform.x }, { translateY: transform.y }, { scale: transform.scale }] }]}>
        <ProductImage uri={uri} label={title} />
      </View>
    </View>
    <View style={styles.controls}>
      <Choice label="−" accessibilityLabel="Réduire l’image" disabled={transform.scale === 1} onPress={() => gesture.update(transform.scale - 0.5)} />
      <Choice label={`${Math.round(transform.scale * 100)} % · Réinitialiser`} onPress={() => gesture.update(1, 0, 0)} />
      <Choice label="+" accessibilityLabel="Agrandir l’image" disabled={transform.scale === 4} onPress={() => gesture.update(transform.scale + 0.5)} />
    </View>
  </>;
}

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const uri = images[index];
  if (!uri) return <View style={[styles.empty, { backgroundColor: theme.backgroundElement }]}><ThemedText>Aucune image disponible</ThemedText></View>;
  const navigation = <View style={styles.controls}>
    <Choice label="Précédente" disabled={index === 0} onPress={() => setIndex(n => n - 1)} />
    <ThemedText accessibilityLiveRegion="polite">{index + 1} / {images.length}</ThemedText>
    <Choice label="Suivante" disabled={index === images.length - 1} onPress={() => setIndex(n => n + 1)} />
  </View>;
  return <View style={styles.gallery}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Agrandir l’image ${index + 1} de ${title}`} onPress={() => setOpen(true)}
      style={[styles.preview, { aspectRatio: width <= 375 ? 1 : 4 / 3, backgroundColor: theme.backgroundElement }]}>
      <ProductImage key={uri} uri={uri} label={`${title}, image ${index + 1}`} />
    </Pressable>
    <ThemedText themeColor="textSecondary">Touchez l’image pour l’agrandir</ThemedText>
    {images.length > 1 && <>
      {navigation}
      <ScrollView horizontal contentContainerStyle={styles.thumbnails}>
        {images.map((image, i) => <Pressable key={image} accessibilityRole="button" accessibilityLabel={`Voir l’image ${i + 1}`} accessibilityState={{ selected: i === index }} onPress={() => setIndex(i)}
          style={[styles.thumbnail, { borderColor: i === index ? theme.accent : theme.border, borderWidth: i === index ? 3 : 1 }]}>
          <ProductImage uri={image} label={`Miniature ${i + 1}`} />
        </Pressable>)}
      </ScrollView>
    </>}
    <Modal visible={open} onRequestClose={() => setOpen(false)} animationType="fade">
      <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]} accessibilityViewIsModal>
        <Choice label="Fermer la galerie" onPress={() => setOpen(false)} />
        {open && <ZoomImage key={uri} uri={uri} title={title} />}
        {navigation}
      </SafeAreaView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  gallery: { gap: Spacing.small },
  preview: { width: '100%', borderRadius: Radius.panel, overflow: 'hidden' },
  empty: { minHeight: 160, padding: Spacing.four, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  thumbnails: { gap: Spacing.two },
  thumbnail: { width: 64, height: 64, borderRadius: Radius.control, overflow: 'hidden' },
  modal: { flex: 1, padding: Spacing.three, gap: Spacing.small },
  viewport: { flex: 1, overflow: 'hidden' },
});
