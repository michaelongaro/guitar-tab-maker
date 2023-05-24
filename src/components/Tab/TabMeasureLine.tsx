import { useState, Fragment, type CSSProperties } from "react";
import { useTabStore } from "~/stores/TabStore";
import { shallow } from "zustand/shallow";
import { motion } from "framer-motion";
import { type TabColumn } from "./TabColumn";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RxDragHandleDots2 } from "react-icons/rx";

const sectionVariants = {
  expanded: {
    opacity: 1,
    scale: 1,
  },
  closed: {
    opacity: 0,
    scale: 0,
  },
};

const initialStyles = {
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
  filter: "drop-shadow(0px 5px 5px transparent)",
};

function TabMeasureLine({
  columnData,
  sectionIndex,
  columnIndex,

  reorderingColumns,
  showingDeleteColumnsButtons,
}: Omit<
  TabColumn,
  | "editingPalmMuteNodes"
  | "setEditingPalmMuteNodes"
  | "lastModifiedPalmMuteNode"
  | "setLastModifiedPalmMuteNode"
>) {
  const [hoveringOnHandle, setHoveringOnHandle] = useState(false);
  const [grabbingHandle, setGrabbingHandle] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } =
    // hoping that columnIndex is fine here. if you can drag across sections we will need to modify.
    useSortable({ id: `${columnIndex}` });

  const { editing, tabData, setTabData } = useTabStore(
    (state) => ({
      editing: state.editing,
      tabData: state.tabData,
      setTabData: state.setTabData,
    }),
    shallow
  );

  return (
    <motion.div
      key={`tabColumn${columnIndex}`}
      ref={setNodeRef}
      layoutId={`tabColumn${columnIndex}`}
      style={initialStyles}
      initial="closed"
      animate={
        transform
          ? {
              x: transform.x,
              y: transform.y,
              opacity: 1,
              scale: isDragging ? 1.05 : 1,
              zIndex: isDragging ? 1 : 0,
              filter: isDragging
                ? "drop-shadow(0px 5px 5px rgba(0, 0, 0, 0.25)"
                : "drop-shadow(0px 5px 5px transparent)",
            }
          : initialStyles
      }
      exit="closed"
      transition={{
        duration: !isDragging ? 0.25 : 0,
        easings: {
          type: "spring",
        },
        x: {
          duration: !isDragging ? 0.3 : 0,
        },
        y: {
          duration: !isDragging ? 0.3 : 0,
        },
        scale: {
          duration: 0.25,
        },
        zIndex: {
          delay: isDragging ? 0 : 0.25,
        },
      }}
      variants={sectionVariants}
      className="baseVertFlex relative mb-[3.2rem] mt-4"
    >
      {columnData.map((note, index) => (
        <Fragment key={index}>
          {index === 0 && (
            <div className="baseFlex mb-2 h-9 w-full">
              {note === "-" && (
                <div className="h-[1px] w-full bg-pink-50"></div>
              )}
            </div>
          )}

          {index > 0 && index < 7 && (
            <div
              style={{
                borderTop: `${
                  index === 1 ? "2px solid rgb(253 242 248)" : "none"
                }`,
                height: `${index === 1 || index === 6 ? "46px" : "48px"}`,
                borderBottom: `${
                  index === 6 ? "2px solid rgb(253 242 248)" : "none"
                }`,
              }}
              className="w-[2px] bg-pink-50"
              onMouseEnter={() => console.log("hovering on measure line")}
            ></div>
          )}

          {index === 7 && (
            <div className="relative mt-2 h-0 w-full">
              {/* not sure if necessary, currently used just for positional purposes */}
            </div>
          )}

          {index === 8 && (
            <div
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="hover:box-shadow-md absolute bottom-[-2.75rem] cursor-grab rounded-md text-pink-50 active:cursor-grabbing"
              onMouseEnter={() => setHoveringOnHandle(true)}
              onMouseDown={() => setGrabbingHandle(true)}
              onMouseLeave={() => setHoveringOnHandle(false)}
              onMouseUp={() => setGrabbingHandle(false)}
            >
              <RxDragHandleDots2 className="h-8 w-6" />
              <div
                style={{
                  opacity: hoveringOnHandle ? (grabbingHandle ? 0.5 : 1) : 0,
                }}
                className="absolute bottom-0 left-1/2 right-1/2 h-8 -translate-x-1/2 rounded-md bg-pink-200/30 p-4 transition-all"
              ></div>
            </div>
          )}
        </Fragment>
      ))}
    </motion.div>
  );
}

export default TabMeasureLine;
