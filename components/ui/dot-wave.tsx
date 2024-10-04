import { motion, Transition } from "framer-motion";
import React from "react";

const ContainerVariants = {
    initial: {
        transition: {
            staggerChildren: 0.13
        }
    },
    animate: {
        transition: {
            staggerChildren: 0.13
        }
    }
};

const DotVariants = {
    initial: {
        y: "0%"
    },
    animate: {
        y: "100%"
    }
};

const DotTransition: Transition = {
    duration: 0.4,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
};

export default function ThreeDotsWave() {
    return (
        <div className="flex items-center justify-center w-full mt-10">
            <motion.div className="w-44 h-24 flex justify-around"
                variants={ContainerVariants}
                initial="initial"
                animate="animate"
            >
                <Dot />
                <Dot />
                <Dot />
            </motion.div>
        </div>
    );
}



function Dot() {
    return <motion.div className="w-5 h-5 rounded-full bg-github-secondary dark:bg-github-secondary"
        variants={DotVariants}
        transition={DotTransition}
    />
}