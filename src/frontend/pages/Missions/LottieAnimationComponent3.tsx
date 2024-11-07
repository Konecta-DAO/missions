import React from 'react';
import { useLottie } from 'lottie-react';
import SVG3 from '../../../../public/assets/NFIDearn.json';

const LottieAnimationComponent3: React.FC = () => {
    const options = {
        animationData: SVG3,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return <div>{View}</div>;
};

export default LottieAnimationComponent3;
