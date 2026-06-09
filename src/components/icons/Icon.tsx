import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/src/theme';

export type IconName =
  | 'calendar' | 'box' | 'cart' | 'server' | 'leaf' | 'plus' | 'minus'
  | 'chevL' | 'chevR' | 'chevD' | 'search' | 'check' | 'x' | 'user' | 'users'
  | 'gear' | 'trash' | 'alert' | 'clock' | 'grid' | 'cols' | 'list' | 'arrow'
  | 'pin' | 'linen' | 'dish' | 'bath' | 'refresh' | 'edit' | 'logout' | 'menu'
  | 'mobile' | 'note' | 'sun' | 'tools' | 'home';

// Mapping vers @expo/vector-icons (style linear, stroke ~1.6 -> Feather).
// Quelques entrées tombent sur MaterialCommunityIcons faute d'équivalent Feather.
type Mapping =
  | { lib: 'feather'; name: React.ComponentProps<typeof Feather>['name'] }
  | { lib: 'mci'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

const MAP: Record<IconName, Mapping> = {
  calendar: { lib: 'feather', name: 'calendar' },
  box:      { lib: 'feather', name: 'box' },
  cart:     { lib: 'feather', name: 'shopping-cart' },
  server:   { lib: 'feather', name: 'server' },
  leaf:     { lib: 'mci', name: 'leaf' },
  plus:     { lib: 'feather', name: 'plus' },
  minus:    { lib: 'feather', name: 'minus' },
  chevL:    { lib: 'feather', name: 'chevron-left' },
  chevR:    { lib: 'feather', name: 'chevron-right' },
  chevD:    { lib: 'feather', name: 'chevron-down' },
  search:   { lib: 'feather', name: 'search' },
  check:    { lib: 'feather', name: 'check' },
  x:        { lib: 'feather', name: 'x' },
  user:     { lib: 'feather', name: 'user' },
  users:    { lib: 'feather', name: 'users' },
  gear:     { lib: 'feather', name: 'settings' },
  trash:    { lib: 'feather', name: 'trash-2' },
  alert:    { lib: 'feather', name: 'alert-triangle' },
  clock:    { lib: 'feather', name: 'clock' },
  grid:     { lib: 'feather', name: 'grid' },
  cols:     { lib: 'feather', name: 'columns' },
  list:     { lib: 'feather', name: 'list' },
  arrow:    { lib: 'feather', name: 'arrow-right' },
  pin:      { lib: 'feather', name: 'map-pin' },
  linen:    { lib: 'mci', name: 'bed-outline' },
  dish:     { lib: 'mci', name: 'silverware-fork-knife' },
  bath:     { lib: 'mci', name: 'shower' },
  refresh:  { lib: 'feather', name: 'refresh-cw' },
  edit:     { lib: 'feather', name: 'edit-2' },
  logout:   { lib: 'feather', name: 'log-out' },
  menu:     { lib: 'feather', name: 'menu' },
  mobile:   { lib: 'feather', name: 'smartphone' },
  note:     { lib: 'feather', name: 'file-text' },
  sun:      { lib: 'feather', name: 'sun' },
  tools:    { lib: 'feather', name: 'tool' },
  home:     { lib: 'feather', name: 'home' },
};

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 20, color = colors.ink }: Props) {
  const entry = MAP[name];
  if (entry.lib === 'feather') return <Feather name={entry.name} size={size} color={color} />;
  return <MaterialCommunityIcons name={entry.name} size={size} color={color} />;
}
