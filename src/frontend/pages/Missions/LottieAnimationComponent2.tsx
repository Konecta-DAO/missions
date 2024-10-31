import React from 'react';
import { useLottie } from 'lottie-react';
import SVG2 from '../../../../public/assets/NFIDmissions.json';

const LottieAnimationComponent2: React.FC = () => {
    const options = {
        animationData: SVG2,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return <div>{View}</div>;
};

export default LottieAnimationComponent2;
