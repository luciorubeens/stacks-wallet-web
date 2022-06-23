import { useRef, useCallback, memo, ReactNode, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { Box, Flex, useEventListener, transition, FlexProps } from '@stacks/ui';

import { useOnClickOutside } from '@app/common/hooks/use-onclickoutside';
import { noop } from '@app/common/utils';
import { hideScrollbarStyle } from '@app/components/global-styles/hide-scrollbar';

import { DrawerHeader } from './drawer-header';

function useDrawer(isShowing: boolean, onClose: () => void, pause?: boolean) {
  const ref = useRef(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isShowing && e.key === 'Escape') {
        onClose();
      }
    },
    [onClose, isShowing]
  );

  useOnClickOutside(ref, !pause && isShowing ? onClose : null);
  useEventListener('keydown', handleKeyDown);

  return ref;
}

export interface BaseDrawerProps extends Omit<FlexProps, 'title'> {
  children?: ReactNode;
  enableGoBack?: boolean;
  icon?: JSX.Element;
  isShowing: boolean;
  onClose?(): void;
  pauseOnClickOutside?: boolean;
  title?: string;
}
export const BaseDrawer = memo((props: BaseDrawerProps) => {
  const { children, enableGoBack, icon, isShowing, onClose, pauseOnClickOutside, title, ...rest } =
    props;
  const ref = useDrawer(isShowing, onClose ? onClose : noop, pauseOnClickOutside);
  const navigate = useNavigate();

  const onGoBack = () => navigate(-1);

  return (
    <Flex
      display={isShowing ? 'flex' : 'none'}
      bg={`rgba(0,0,0,0.${isShowing ? 4 : 0})`}
      transition={transition}
      position="fixed"
      top={0}
      left={0}
      height="100%"
      pt="loose"
      width="100%"
      alignItems={['flex-end', 'center', 'center']}
      justifyContent="center"
      flexDirection="column"
      zIndex={1000}
      style={{
        pointerEvents: !isShowing ? 'none' : 'unset',
        userSelect: !isShowing ? 'none' : 'unset',
        willChange: 'background',
      }}
      {...rest}
    >
      <Flex
        flexDirection="column"
        flexGrow={0}
        ref={ref}
        opacity={isShowing ? 1 : 0}
        transform={isShowing ? 'none' : 'translateY(35px)'}
        transition={isShowing ? transition + ' 0.1s' : transition}
        transitionDuration="0.4s"
        willChange="transform, opacity"
        width="100%"
        maxWidth="472px"
        bg="white"
        borderTopLeftRadius="24px"
        borderTopRightRadius="24px"
        borderBottomLeftRadius={[0, '24px', '24px', '24px']}
        borderBottomRightRadius={[0, '24px', '24px', '24px']}
        position="relative"
        mt={['auto', 'unset', 'unset', 'unset']}
        maxHeight={['calc(100vh - 24px)', 'calc(100vh - 96px)']}
      >
        <DrawerHeader
          enableGoBack={enableGoBack}
          icon={icon}
          onClose={onClose}
          onGoBack={onGoBack}
          title={title}
        />
        <Box
          css={css`
            overflow-y: scroll;
            ${hideScrollbarStyle}
          `}
        >
          <Flex maxHeight="100%" flexGrow={1} flexDirection="column">
            <Suspense fallback={<></>}>{children}</Suspense>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
});
