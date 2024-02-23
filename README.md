# Tag Bot

## About

Basically? A [Discord](https://discord.com/) bot built with [discord.js](https://discord.js.org/). Its purpose is to manage a game of tag. You get to decide what that looks like. In my house we have some rules regarding nerf guns... You can use this as an example:

### Example Rules

```
1. You must fire the dart from the gun to tag someone.
2. Once you are tagged, you must wait until the next day to tag someone else
3. Don’t tag people while they are eating or drinking, or in other unreasonable circumstances.
4. Don’t tag people in their bedrooms
5. There are two guns. If you miss both shots on someone, you need to wait 30 minutes to try again

Rules may be updated if needed
```

Have fun!

## Commands

`/register`: This command registers you for the current game, adding you in and making you a possible target.  
`/tag <user>`: The most important command. This allows you to tag someone, making them the new tagger and resetting their streak.  
`/whos-tagged`: Checks who is currently tagged in case you forget.  
`/scoreboard`: Shows all registered users stats, including how long they've survived in total, how many points (tags) they have, and how long their best streak has been.

## Roadmap

Some things I'd like to do in the future with this.

- Move to a real database
- Move to TypeScript
- Add tests
  - Add unit tests
  - Add integration tests
  - Add test coverage/test coverage badge
