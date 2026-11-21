import React from 'react';
import {Composition} from 'remotion';
import {Episode, DURATION} from './Episode';

export const Root: React.FC = () => (
  <>
    <Composition id="EP01" component={Episode} durationInFrames={DURATION} fps={30} width={1920} height={1080} defaultProps={{sfx: true}} />
    <Composition id="EP01-clean" component={Episode} durationInFrames={DURATION} fps={30} width={1920} height={1080} defaultProps={{sfx: false}} />
  </>
);
