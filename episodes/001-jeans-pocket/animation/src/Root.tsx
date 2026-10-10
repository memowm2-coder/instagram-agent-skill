import React from 'react';
import {Composition} from 'remotion';
import {KeyframePreview} from './KeyframePreview';

export const Root: React.FC = () => (
  <Composition id="KeyframePreview" component={KeyframePreview}
    durationInFrames={300} fps={30} width={1920} height={1080} />
);
