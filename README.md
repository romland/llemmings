# 💚💙 Llemmings 💙💚
Llemmings is a game written by Large Language Models (LLM), like ChatGPT and GPT-4. The
intention is that it is _only_ written by LLMs.

**Your job, as a human, is to copy and paste code.**

There are a few exceptions, such as removing redeclared variables and similar small things.
But other than that, the code should be written by the LLM.

The latest and greatest version is [here](https://romland.github.io/llemmings)!  


## 🎮 The game
It is (probably) not yet a game. But ...

Llemmings is based on a game with a similar name by DMA Design. 

In short: green and blue blocks (will be) dropping out of a hatch and the goal is to bring
them safely home. These green and blue blocks are pretty dumb. Your job, as a human, is to 
assist them by giving them instructions. For instance, stop them from going in some direction.

The implementation so far is all from memory. Some things are very likely to be wrong. The aim
is not to make a perfect clone of its namesake, but if it is about the same, it's of course fun.


## 🖥️ The real game
It's the journey!

Your second job, as a human, is to give instructions to your language model of choice.


### 📝 Prompts
You will quickly realize this is a painful journey. You will find yourself reading code. A lot.

Very often ... in fact, all the time ... you will get code that does not work, or only
partially works. This means you as a human **failed**. You need to change something in your
prompt and try again.

_The process roughly goes something like this_
1. You have a goal, like adding a green and blue block that can climb.
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


### 🗃️ Organizing prompts
README TODO: Need to figure out how to best connect prompts to a commit and yet have prompts available for easy copy/pasting. It could be that I need to write something for this.  
README TODO: At the end of the day, once figured out, there should be notes here about how you organize your prompts!  
README TODO: Having prompts in the source code is getting too painful now.  


## 🔥 Code and quality
Up til now, quality has not been a big concern. It's one giant steamy pile of spaghetti (llemming code?).

It's been handy to have everything in one file for prompting. The instructions to the LLMs (prompts)
will sadly have to be separated from the code in the near future, it's getting too much.

At some point down the line, probably soon, refactoring needs to be done by the LLM (😱). The `update` function in the `Lemming`
object is especially unwieldy. To the point where I grin every time I see it.


### 🧠 Cheating
If you add/change code that you did not get by the LLM, make sure that it's marked 
with something like:

"// HUMAN: I Have no hair left. I ran out of patience. I, bad human, added this line."

This is essentially cheating. But we are humans, we cheat.


## 🚃 Contributing and pull requests
You can contribute. Don't be afraid. Blame the LLM.

Any pull requests are welcome, just make sure you  
...say which prompt(s) you used  
...say which LLM was used (if you want to be fancy, you can disclose temperature, etc)  

If you cheated, flag the line with a "HUMAN: ..." comment in the code.

Currently I have settled for commit messages like this:
```
Commit title
ChatGPT: subtitle

>>> Prompt 1:
... a prompt that contributed code
>>> Prompt 2:
... a prompt that contributed code
...
```
Preferably only one prompt per commit. But I failed in the beginning.

_You can check the commit history and you'll get the gist._


## 🏃‍♀️ Compiling, installing, running
Just double click `index.html`.


## TODO
There is a lot. It would be nice if there was a list somewhere. There isn't. Just do what you want to do.

Some thoughts: make it pretty, animations (maybe their green hair should move in the wind, maybe they have legs!),
shaders, sound, speach bubbles (Oh no!), add the missing types of green-blue blocks (the builder looks particularly nasty on paper),
the goal of the game, score, better maps, levels. ...

README TODO: Maybe add a screenshot(s) or video? 


## ✍️ An example
Note that a prompt like this grew over time (likely hours), it's not like it was just written
down and in one shot came good code fit-for-purose. It's all an iterative process. And it feels
very much like ... programming.  

```
Do pixel perfect collision detection for a sprite that looks like a blue lemming with green hair
(a blue box and a green box, basically), give it its own structure with position, velocity, etc.
It should move around on a 2d canvas which has gravity (that is, when there is no ground under it,
it should fall down). If it runs in to an obstacle on the x axis it should turn around and walk
the other way. If it falls into something on the y axis it should stop moving on the Y axis and
start walking on the x axis. If it falls into the water, the lemming is dead. Updates should be
done every frame. There will eventually be many lemmings, so do note that they are not controlled
by keys, they move by themselves and is constrained by the collision rules outlined above.

It is important that you use the declared things I mentioned above and just give me the code with
minor comments, no need to explain anything in plain text.
```
This was a very ambitious one. And it largely let me down -- but we got there in the end.


## License
AGPL.


## Random thoughts
Brave new world.  
All about the specifiprompts.  
The age of average (text).  
How clever/dumb/neither these LLMs are.  
How it still feels like programming. But is it.  
It is still creating. Which is what we like. Right.  

Oh, woe is us.
