import Svg, { Path } from 'react-native-svg';

export default function Sad({ size = 24, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18" />
      <Path d="M9 10h-.01" />
      <Path d="M15 10h-.01" />
      <Path d="M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1" />
    </Svg>
  );
}
