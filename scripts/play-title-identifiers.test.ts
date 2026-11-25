import assert from "node:assert/strict";

import { requiredReleaseYear, titleIdentifierIssue } from "../lib/play/title-identifiers";

const movie = (guess: string, expected: string) => titleIdentifierIssue(guess, expected, "guess-the-movie");
const book = (guess: string, expected: string) => titleIdentifierIssue(guess, expected, "guess-the-book");

assert.equal(movie("Finding Nemo 2", "Finding Nemo"), "Check the sequel number.");
assert.equal(movie("Rocky III", "Rocky IV"), "Check the sequel number.");
assert.equal(movie("Rocky 4", "Rocky IV"), undefined);
assert.equal(movie("Terminator 3: Judgment Day", "Terminator 2: Judgment Day"), "Check the sequel number.");
assert.equal(movie("Dune Part Two", "Dune: Part II"), undefined);
assert.equal(movie("Dune", "Dune: Part II"), "Check the sequel number.");
assert.equal(movie("Star Wars: Episode 5 – A New Hope", "Star Wars: Episode IV – A New Hope"), "Check the sequel number.");
assert.equal(book("A Long Story Book II", "A Long Story Book I"), "Check the volume number.");
assert.equal(book("Collected Tales Vol. 3", "Collected Tales Volume III"), undefined);
assert.equal(book("Collected Tales", "Collected Tales Volume III"), "Check the volume number.");
assert.equal(movie("The Thing (2011)", "The Thing (1982)"), "Check the release year.");
assert.equal(movie("The Thing", "The Thing (1982)"), "Check the release year.");
assert.equal(movie("The Tihng (1982)", "The Thing (1982)"), undefined);
assert.equal(movie("2001: A Space Odysey", "2001: A Space Odyssey"), undefined);
assert.equal(movie("1917", "1917"), undefined);
assert.equal(movie("Blade Runer 2049", "Blade Runner 2049"), undefined);
assert.equal(movie("American Histoy X", "American History X"), undefined);
assert.equal(movie("Withnail and", "Withnail and I"), undefined);
assert.equal(book("The Book I Borrowd", "The Book I Borrowed"), undefined);
assert.equal(book("Catch-22", "Catch-22"), undefined);
assert.equal(requiredReleaseYear("Blade Runner 2049"), undefined);
assert.equal(titleIdentifierIssue("word 3", "word", "guess-the-word"), undefined);

console.log("title identifier tests passed");
