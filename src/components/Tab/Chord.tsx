import { useState } from "react";
import { type Chord as ChordType, useTabStore } from "~/stores/TabStore";
import { shallow } from "zustand/shallow";
import { parse, toString } from "~/utils/tunings";
import { Input } from "../ui/input";

interface Chord {
  chordThatIsBeingEdited: { index: number; value: ChordType };
  editing: boolean;
}

function Chord({ chordThatIsBeingEdited, editing }: Chord) {
  const [isFocused, setIsFocused] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const { tuning, setChordThatIsBeingEdited } = useTabStore(
    (state) => ({
      tuning: state.tuning,
      setChordThatIsBeingEdited: state.setChordThatIsBeingEdited,
    }),
    shallow
  );

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // prevent cursor from moving

      const newNoteToFocus = document.getElementById(
        `input-chordModal-chordModal-${index + 1}`
      );

      newNoteToFocus?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // prevent cursor from moving

      const newNoteToFocus = document.getElementById(
        `input-chordModal-chordModal-${index - 1}`
      );

      newNoteToFocus?.focus();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const value = e.target.value;

    // regular notes
    // wanted to always allow a-g in regular note even if there was a number
    // present for easy placement of chords
    let valueHasAChordLetter = false;
    let chordLetter = "";
    for (let i = 0; i < value.length; i++) {
      if ("abcdefgABCDEFG".includes(value.charAt(i))) {
        valueHasAChordLetter = true;
        chordLetter = value.charAt(i);
        break;
      }
    }
    if (valueHasAChordLetter) {
      // capital letter means major chord
      // lowercase letter means minor chord

      let chordArray: string[] = [];
      if (chordLetter === "A") {
        chordArray = ["", "0", "2", "2", "2", "0"];
      } else if (chordLetter === "a") {
        chordArray = ["", "0", "2", "2", "1", "0"];
      } else if (chordLetter === "B") {
        chordArray = ["", "2", "4", "4", "4", "2"];
      } else if (chordLetter === "b") {
        chordArray = ["", "2", "4", "4", "3", "2"];
      } else if (chordLetter === "C") {
        chordArray = ["", "3", "2", "0", "1", "0"];
      } else if (chordLetter === "c") {
        chordArray = ["", "3", "5", "5", "4", "3"];
      } else if (chordLetter === "D") {
        chordArray = ["", "", "0", "2", "3", "2"];
      } else if (chordLetter === "d") {
        chordArray = ["", "", "0", "2", "3", "1"];
      } else if (chordLetter === "E") {
        chordArray = ["0", "2", "2", "1", "0", "0"];
      } else if (chordLetter === "e") {
        chordArray = ["0", "2", "2", "0", "0", "0"];
      } else if (chordLetter === "F") {
        chordArray = ["1", "3", "3", "2", "1", "1"];
      } else if (chordLetter === "f") {
        chordArray = ["1", "3", "3", "1", "1", "1"];
      } else if (chordLetter === "G") {
        chordArray = ["3", "2", "0", "0", "0", "3"];
      } else if (chordLetter === "g") {
        chordArray = ["3", "5", "5", "3", "3", "3"];
      }

      setChordThatIsBeingEdited({
        ...chordThatIsBeingEdited,
        value: {
          ...chordThatIsBeingEdited.value,
          frets: chordArray.reverse(),
        },
      });

      return;
    }

    const numberPattern = /^(?:[1-9]|1[0-9]|2[0-2]|0)$/;

    if (value !== "" && !numberPattern.test(value)) return;

    const newChordData = [...chordThatIsBeingEdited.value.frets];

    newChordData[index] = value;

    setChordThatIsBeingEdited({
      ...chordThatIsBeingEdited,
      value: {
        ...chordThatIsBeingEdited.value,
        frets: newChordData,
      },
    });

    return;
  }

  return (
    <div className="baseFlex w-full">
      <div
        style={{
          height: editing ? "284px" : "168px",
          gap: editing ? "1.35rem" : "0.05rem",
          padding: editing ? "0.5rem" : "0.5rem 0.35rem",
        }}
        className="baseVertFlex relative rounded-l-2xl border-2 border-pink-50"
      >
        {toString(parse(tuning), { pad: 1 })
          .split(" ")
          .reverse()
          .map((note, index) => (
            <div key={index}>{note}</div>
          ))}
      </div>

      <div
        style={{
          gap: editing ? "0.5rem" : "0",
        }}
        className="baseVertFlex"
      >
        {chordThatIsBeingEdited.value.frets.map((fret, index) => (
          <div
            key={index}
            style={{
              borderTop: `${
                index === 0 ? "2px solid rgb(253 242 248)" : "none"
              }`,
              paddingTop: `${index === 0 ? "0.45rem" : "0rem"}`,
              borderBottom: `${
                index === 5 ? "2px solid rgb(253 242 248)" : "none"
              }`,
              paddingBottom: `${index === 5 ? "0.45rem" : "0rem"}`,
            }}
            className="baseFlex"
          >
            <div
              style={{
                margin: editing ? "0" : "0.75rem 0",
              }}
              className="h-[1px] w-2 flex-[1] bg-pink-50/50"
            ></div>
            {editing ? (
              <Input
                id={`input-chordModal-chordModal-${index}`}
                type="text"
                autoComplete="off"
                value={fret}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleChange(e, index)}
                style={{
                  borderWidth: `${
                    fret.length > 0 && !isFocused[index] ? "2px" : "1px"
                  }`,
                }}
                className={`h-[2.35rem] w-[2.35rem] rounded-full p-0 text-center 
                            ${fret.length > 0 ? "shadow-md" : "shadow-sm"}
                          `}
                onFocus={() => {
                  setIsFocused((prev) => {
                    prev[index] = true;
                    return [...prev];
                  });
                }}
                onBlur={() => {
                  setIsFocused((prev) => {
                    prev[index] = false;
                    return [...prev];
                  });
                }}
              />
            ) : (
              <>
                {fret !== "" ? (
                  <div className="h-6">{fret}</div>
                ) : (
                  <div
                    style={{
                      margin: editing ? "0" : "0.75rem 0",
                    }}
                    className="h-[1px] w-2 flex-[1] bg-pink-50/50"
                  ></div>
                )}
              </>
            )}
            <div
              style={{
                margin: editing ? "0" : "0.75rem 0",
              }}
              className="h-[1px] w-2 flex-[1] bg-pink-50/50"
            ></div>
          </div>
        ))}
      </div>
      <div
        style={{
          height: editing ? "284px" : "168px",
          padding: editing ? "0.25rem" : "0.25rem 0.15rem",
        }}
        className="rounded-r-2xl border-2 border-pink-50 p-1"
      ></div>
    </div>
  );
}

export default Chord;
