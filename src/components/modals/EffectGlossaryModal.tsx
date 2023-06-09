import { useRef } from "react";
import { useTabStore } from "~/stores/TabStore";
import { shallow } from "zustand/shallow";
import { motion } from "framer-motion";

import EffectGlossary from "../ui/EffectGlossary";

const backdropVariants = {
  expanded: {
    opacity: 1,
  },
  closed: {
    opacity: 0,
  },
};

function EffectGlossaryModal() {
  const innerModalRef = useRef<HTMLDivElement>(null);

  const { setShowEffectGlossaryModal } = useTabStore(
    (state) => ({
      setShowEffectGlossaryModal: state.setShowEffectGlossaryModal,
    }),
    shallow
  );

  return (
    <motion.div
      key={"EffectGlossaryModalBackdrop"}
      className="baseFlex fixed left-0 top-0 z-50 h-[100vh] w-[100vw] bg-black/50"
      variants={backdropVariants}
      initial="closed"
      animate="expanded"
      exit="closed"
      onClick={() => setShowEffectGlossaryModal(false)}
    >
      <div
        ref={innerModalRef}
        style={{
          height: "485px", // height of EffectGlossary
          // not sure why we need this... but it wasn't centered horizontally automatically
          width: "60px",
        }}
      >
        <EffectGlossary forModal />
      </div>
    </motion.div>
  );
}

export default EffectGlossaryModal;
