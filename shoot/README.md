# Boom

This is an experimental game which experiments with mechanics related to Bullet Hell.
It is not a complete game, but it is unlikely it will be completed.

## Playing

This bullet hell takes inspiration from the Touhou series.
As such, the game looks and plays like a barebones simulator of that style of game.

While the game is rendered with squares, the mechanical hitboxes are the circles inscribed by the squares.

### Mechanics

#### Game Over

The Player dies when the red hitbox touches an enemy or an enemy bullet.
When the Player dies, an Extend is spent to revive the player.
If the Player has no more Extends when the Player dies, then the game is over.
The Player begins with two Extends (three "lives").

#### Scoring

Score is incremented under several conditions:

* 100 points are awarded upon grazing an enemy bullet (once per bullet).
* 100 points are awared upon obtaining a Power Item (red loot dropped by defeating enemies).
* Points are awarded upon obtainin a Point Item (blue loot dropped by defeating enemies) proportional to the height of the player, up to a maximum of the Item Get Border Line, up to 10,000 points.

An item is considered collected if the yellow hitbox touches the item.
A bullet is considered grazed if the orange hitbox touches the bullet, but not the red one.

The Item Get Line is 3/4 of the way up the game area from the bottom.

An additional Extend is rewarded to the Player after achieving each of the score milestones:

* 10,000,000
* 20,000,000
* 40,000,000
* 80,000,000
* 160,000,000

#### Power Level

The Player's Power Level determines how many streams of bullets the Player can fire at once.
There are five Power Levels, represented by 0 to 4 stars on the HUD. 
Power level increases after collecting 10 Power Items.
Power Items collected after reaching the maximum Power Level only contribute to score and do not affect the Player's damage output.

Upon death, the Player's Power Level reverts to 0.
2/3 of the Player's Power Level upon death is spawned as power items, allowing the Player to partially restore the Power Level.

#### Enemies

Enemies are represented with green squares.
Colliding with an Enemy results in a Player's death.
Enemies may also spawn bullets, represented by white squares, and colliding with these bullets will result in a Player's death.

Enemies begin with a set amount of health that decrements when colliding with any of the Player's bullets.
When the Enemy's health reaches zero, the Enemy is despawned and drops loot in the form of Power Items and Point Items that are launched up in the air.

#### Controls

* Directional controls are arrow keys or ASDW.
* Shoot with Z key
* Focus Mode with Shift.
  This makes the player move more slowly for easier movement and narrows the spread of attacking bullets.
* Debug action: Spawns enemies ahead of the player.
    * I key: Spawns enemies that shoot in a random direction
    * O key: Spawns enemies that shoot at the player's location.
      Good opportunity to practice your streaming technique.

### Strategy

The basic strategy to a high score is to defeat a large amount of enemies and move above the Item Get Line.

More advanced players may more optimally increase their scores by grazing as many bullets as possible.
This can most easily be done by the streaming technique in which the player remains in place as many enemy bullets target them, and then the player moves slowly avoid the bullets while grazing.
However, as this game has no time limit and the player can spawn enemies at any desired rate with the debug actions, this technique is largely unnecessary in the game's current state.

## Contributing

To rebuild script, use from this directory:

```shell
npx tsc -w
```

## TODO

* Render the player hitboxes as circles
* IFrames after death
* Bullet patterns: common
* Boss scripts
* Bullet types
    * Player bullet types
    * Enemy bullet types
* Sprites
    * Player
    * Enemy bullet types
    * Player bullet types
    * Mobs
