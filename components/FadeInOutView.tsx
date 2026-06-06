import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ViewProps } from 'react-native';

interface FadeInOutViewProps extends ViewProps {
  children?: React.ReactNode;
}

export default function FadeInOutView({ children, className, ...props }: FadeInOutViewProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className={className}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
