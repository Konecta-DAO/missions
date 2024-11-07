import React from 'react';
import { useLottie } from 'lottie-react';
import SVG1 from '../../../../public/assets/NFIDairdrop.json';

const LottieAnimationComponent1: React.FC = () => {
    const options = {
        animationData: SVG1,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return <div>{View}</div>;
};

export default LottieAnimationComponent1;
