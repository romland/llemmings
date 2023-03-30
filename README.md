# Llemmings
Llemmings is a game written by Large Language Models (LLM), like ChatGPT and GPT-4. The
intention is that it is _only_ written by LLMs.

There are a few exceptions, such as removing redeclared variable names and similar tiny things.
But other than that, the code should be written by the LLM.

Your job, as a human, is to copy and paste code.


## The game
First of all, is not yet a game. But ...

Llemmings is based on a game with a similar name by DMA Design. 

In short: green and blue blocks (will be) dropping out of a hatch and the goal is to bring
them safely home. These green and blue blocks are pretty dumb. Your job as a human is to 
assist them by giving them instructions. For instance, stop them from going in some direction.

It must be said that the implementeation so far is all from memory. Some things are very likely
to be wrong. The aim is not to make a perfect clone of its namesake. But if it is about the same,
it's of course fun.


## The real game
The real game is in the journey.

Your job as a human is to assist the LLM by giving it instructions.

Any irony is purely coincidental.


### Prompts
You will quickly realize this is a painful journey. You will find yourself reading code. A lot.

Very often ... in fact, all the time ... you will get code that does not work, or only
partially works. This means you as a human failed. You need to change something in your
prompt and try again.

Process is roughly:
1. You have a goal, like adding a red and green block that can climb.
   You write a basic prompt explaining how it should work
2. Out comes some code, you immediately see that this is garbage
3. You adjust the prompt by adding some more details.
   Eventually you get a passable snippet.
4. You test it and see that it does not work, you spend time figuring out
   why and then adjust the prompt accordingly.

Eventually you will get something that works. Kind of.

Sometimes you surprise yourself and just one-shot a prompt. It all just works on first try.
One such example was the death explosion. One prompt and it just ... worked.

Just know that it will hurt to debug a snippet of code, just to figure out how you should change
your prompt. You, human, must resist fixing the code. You, human, must fix the prompt instead.


### Organizing prompts
TODO: Need to figure out how to best connect prompts to a commit and yet have prompts
      available for easy copy/pasting. It could be that I need to write something for
      this.
TODO: At the end of the day, once figured out, there should be notes here about how you organize your prompts!


## Code quality
As of now, it's not been a big concern. It's one giant steamy pile of spaghetti (llemming code?).

It's been handy to have everything in one file for prompting. 

At some point down the line, probably soon, refactoring needs to be done.


## Cheating
If you add/change code that you did not get by the LLM, make sure that it's marked 
with something like:

"// HUMAN: I Have no hair left. I ran out of patience. I, bad human, added this line."

This is essentially cheating. But we all cheat.


## Contributing and pull requests
Anyone can contribute. Don't be afraid. Blame the LLM.

Any pull requests are welcome, just make sure you
...say which prompt(s) you used
...say which LLM was used

And of course, if you cheated, flag the line with a "HUMAN: ..." comment in the code.


## An examples
Note that this prompt grew over time, it's not like I just wrote it down in one shot and
out came good code. It's all an iterative process. It's a process that feels very much
like ... programming.


## License
MIT.
