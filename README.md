# Llemmings
Llemmings is a game written by Large Language Models (LLM), like ChatGPT and GPT-4. The
intention is that it is _only_ written by LLMs.

Your job, as a human, is to copy and paste code.

There are a few exceptions, such as removing redeclared variables and similar small things.
But other than that, the code should be written by the LLM.

## README TODOS
TODO: Need emojis in this file. It's all the rage!  
TODO: Screenshot(s), video? and well  
TOOD: a link to current implementation    
https://romland.github.io/llemmings  


## The game
It is (probably) not yet a game. But ...

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
   You write a basic prompt explaining your idea.
2. Out comes some code, you immediately see that this is garbage
3. You adjust the prompt by adding some more details.
   Eventually you get something passable.
4. You test it and see that it does not work at all, you spend time figuring out
   why and then adjust the prompt accordingly.

Eventually you will get something that works. Kind of.

It will hurt to debug a snippet of code to figure out how you should change your prompt.
You, human, must resist fixing the code. You, human, must fix the prompt instead.

Sometimes you surprise yourself and just one-shot a prompt. It all just works on first try.
One such example was the death explosion. It was a happy moment.


### Organizing prompts
TODO: Need to figure out how to best connect prompts to a commit and yet have prompts
      available for easy copy/pasting. It could be that I need to write something for
      this.
TODO: At the end of the day, once figured out, there should be notes here about how you organize your prompts!
TODO: Having prompts in the source code is getting too painful now.


## Code and quality
Up til now, quality has not been a big concern. It's one giant steamy pile of spaghetti (llemming code?).

It's been handy to have everything in one file for prompting.

At some point down the line, probably soon, refactoring needs to be done. The `update` function in the `Lemming`
object is especially unwieldy. To the point where I grin every time I see it.


### Cheating
If you add/change code that you did not get by the LLM, make sure that it's marked 
with something like:

"// HUMAN: I Have no hair left. I ran out of patience. I, bad human, added this line."

This is essentially cheating. But we are humans, we cheat.


## Contributing and pull requests
You can contribute. Don't be afraid. Blame the LLM.

Any pull requests are welcome, just make sure you
...say which prompt(s) you used
...say which LLM was used (if you want to be fancy, you can disclose temperature, etc)

Just make sure that if you cheated, flag the line with a "HUMAN: ..." comment in the code.


## Compiling, installing, running
Just double click `index.html`.


## An example
Note that this prompt grew over time, it's not like I just wrote it down in one shot and
out came good code. It's all an iterative process. It's a process that feels very much
like ... programming.


## License
MIT.
