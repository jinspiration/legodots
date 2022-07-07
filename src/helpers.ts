import { transform } from "typescript";
import { BoardData, Dot } from "./App";
import { Selected } from "./control";

export const smartSelect = (board: BoardData, r: number, place: number) => {
  if (board[place][0] === "circle") {
    const select: [number, Dot] = [place, board[place]];
    return [select];
  }
  const ans: Selected = [];
  const seen: number[] = [];
  const check = (p: number, from: number) => {
    if (!(p in board) || seen.includes(p) || board[p][0] === "circle") return;
    seen.push(p);
    //   console.log('check', p,board[p]);
    const shape = board[p][0];
    const rotate = board[p][2] ?? 0;
    if (shape === "arc") {
      if (from === -1) {
        ans.push([p, board[p]]);
        if (rotate === 0) {
          check(p - 1, 0);
          check(p - r, 2);
        }
        if (rotate === 1) {
          check(p + 1, 1);
          check(p - r, 2);
        }
        if (rotate === 2) {
          check(p + 1, 1);
          check(p + r, 3);
        }
        if (rotate === 3) {
          check(p - 1, 0);
          check(p + r, 3);
        }
      }
      if (rotate === 0) {
        if (from === 1) {
          ans.push([p, board[p]]);
          check(p - r, 2);
        }
        if (from === 3) {
          ans.push([p, board[p]]);
          check(p - 1, 0);
        }
      } else if (rotate === 1) {
        if (from === 0) {
          ans.push([p, board[p]]);
          check(p - r, 2);
        }
        if (from === 3) {
          ans.push([p, board[p]]);
          check(p + 1, 1);
        }
      } else if (rotate === 2) {
        if (from === 0) {
          ans.push([p, board[p]]);
          check(p + r, 3);
        }
        if (from === 2) {
          ans.push([p, board[p]]);
          check(p + 1, 1);
        }
      } else {
        if (from === 1) {
          ans.push([p, board[p]]);
          check(p + r, 3);
        }
        if (from === 2) {
          ans.push([p, board[p]]);
          check(p - 1, 0);
        }
      }
    } else {
      ans.push([p, board[p]]);
      check(p - 1, 0);
      check(p + 1, 1);
      check(p - r, 2);
      check(p + r, 3);
    }
  };
  check(place, -1);
  return ans;
};
