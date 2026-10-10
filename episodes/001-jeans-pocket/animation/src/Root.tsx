import React from 'react';
import {Composition} from 'remotion';
import {KeyframePreview} from './KeyframePreview';
import {Opening5s} from './Opening5s';

export const Root: React.FC = () => (
  <>
  <Composition id="KeyframePreview" component={KeyframePreview}
    durationInFrames={300} fps={30} width={1920} height={1080} />
  <Composition id="Opening5s" component={Opening5s}
    durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
