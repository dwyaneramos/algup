import Svg, { Path } from 'react-native-svg';


export default function Happy({ size = 24, color = '#000000', strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <Path d="M9 9l.01 0" />
      <Path d="M15 9l.01 0" />
      <Path d="M8 13a4 4 0 1 0 8 0h-8" />
    </Svg>
  );
}
