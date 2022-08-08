import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  MdOutlineAddToPhotos,
  MdOutlineCancel,
  MdOutlineCheck,
  MdOutlineDeleteForever,
  MdOutlineEdit,
} from "react-icons/md";
import { GRID, SHAPES } from "./meta";
import useStore, { BoardData, EditorMode } from "./store";

const Gallery: React.FC = () => {
  const gallery = useStore((state) => [state.board, ...state.gallery]);
  const setState = useStore((state) => state.setState);
  const [selectedBoard, setSelectedBoard] = useState<number>(-1);
  const swtichBoard = useStore((state) => state.switchBoard);
  const duplicateBoard = useStore((state) => state.duplicateBoard);
  const changeBoardName = useStore((state) => state.changeBoardName);
  const deleteBoard = useStore((state) => state.deleteBoard);
  const [editName, setEditName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number>(-1);
  const badName = useMemo(() => {
    return (
      editName !== null &&
      (gallery
        .filter((_, i) => i !== selectedBoard)
        .some(({ name: boardName }) => editName === boardName) ||
        editName === "" ||
        editName.length > 18)
    );
  }, [editName, gallery, selectedBoard]);
  return (
    <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] auto-rows-min gap-y-2 place-items-center mx-auto overflow-y-auto scrollbar">
      {deleting !== -1 && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          onClick={() => setDeleting(-1)}
        >
          <div
            className="w-56 p-4 bg-zinc-700 rounded-lg shadow-sm shadow-gray-400 flex flex-col gap-2 items-center z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-white text-center">
              Are you sure you want to delete "
              <span>{gallery[deleting].name}</span>" ?
            </h1>
            <BoardView
              data={gallery[deleting].data}
              color={gallery[deleting].color}
            />
            <div className="w-full flex justify-around">
              <div className="button-sm" onClick={() => setDeleting(-1)}>
                <MdOutlineCancel className="fill-green-400" />
              </div>
              <div
                className="button-sm"
                onClick={() => {
                  deleteBoard(deleting);
                  setDeleting(-1);
                }}
              >
                <MdOutlineCheck className="fill-rose-500" />
              </div>
            </div>
          </div>
        </div>
      )}
      {gallery.map(({ name, color, data }, i) => {
        if (!name) return null;
        return (
          <div
            key={i}
            className="relative bg-zinc-700 rounded-md shadow-sm shadow-gray-400 overflow-hidden"
            onClick={() => {
              setSelectedBoard((s) => (s === i ? -1 : i));
            }}
          >
            <BoardView data={data} color={color} />
            <div className="absolute top-0 inset-x-0 h-8">
              <input
                type="text"
                className={`text-center text-w-full focus:outline-none text-white h-full w-full rounded-md ${
                  selectedBoard !== i
                    ? "bg-indigo-600"
                    : badName
                    ? "bg-rose-500"
                    : "bg-teal-500 focus:border-yellow-500 focus:border-2"
                }`}
                value={
                  editName === null || selectedBoard !== i ? name : editName
                }
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  setSelectedBoard(i);
                  setEditName(name);
                }}
                onBlur={(e) => {
                  if (!badName) changeBoardName(i, editName as string);
                  setEditName(null);
                }}
              />
            </div>
            {i === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
                <span className="bg-sky-500 px-2 rounded-md shadow-md text-cyan-900">
                  CURRENT
                </span>
              </div>
            )}
            {selectedBoard === i && (
              <div className="absolute bottom-0 inset-x-0 h-8 bg-teal-500 rounded-md [&>*]:button-xs grid grid-cols-3 place-items-center">
                <div
                  onClick={() => {
                    swtichBoard(i);
                  }}
                >
                  <MdOutlineEdit className="fill-white" />
                </div>
                <div onClick={() => duplicateBoard(i)}>
                  <MdOutlineAddToPhotos className="fill-white" />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleting(i);
                  }}
                >
                  <MdOutlineDeleteForever className="fill-red-500" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Gallery);

const BoardView: React.FC<{ data: BoardData; color: string }> = React.memo(
  ({ data, color }) => {
    const [m, n] = [data.length, data[0].length];
    return (
      <svg className="w-40 h-40 p-2" viewBox={`0 0 ${n * GRID} ${m * GRID}`}>
        <rect
          x="0"
          y="0"
          rx="3"
          className={"fill-lego-" + color}
          width={n * GRID}
          height={m * GRID}
        />
        {data.map((row, i) => {
          return (
            <React.Fragment key={"" + i}>
              {row.map((dots, j) => {
                return dots.map(([shape, rotate, color]) => {
                  if (!SHAPES.includes(shape)) return null;
                  const key = [i, j, shape, rotate, color].join(".");
                  return (
                    <use
                      key={key}
                      href={"#" + shape}
                      className={"fill-lego-" + color}
                      transform={
                        `translate(${j * GRID},${i * GRID})` +
                        (rotate === 0
                          ? ""
                          : `rotate(${rotate} ${GRID / 2} ${GRID / 2})`)
                      }
                    />
                  );
                });
              })}
            </React.Fragment>
          );
        })}
      </svg>
    );
  }
);
