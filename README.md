
# Workout Timer ⏱️

A simple, interactive command-line interval timer for exercise routines. Automatically alternates between action (exercise) and rest periods until your total workout time expires.

## Features

- ⚡ **Action Timer**: Set duration for exercise/action periods
- 😴 **Rest Timer**: Set duration for recovery periods  
- ⏰ **Total Time Limit**: Automatically stops when total workout time expires
- 🔄 **Auto-alternating**: Seamlessly switches between action and rest phases
- 🎵 **Audio Alerts**: Beeps when transitioning between phases
- 📊 **Live Display**: Clear countdown with cycle tracking
- 🛑 **Easy Stop**: Press Ctrl+C to stop at any time

## Installation

No external dependencies required! Just Python 3.6+

```bash
cd workout_timer
```

## Usage

### Basic Run

```bash
python3 workout_timer.py
```

You will be prompted to enter:
1. **Action time** (seconds): How long to exercise
2. **Rest time** (seconds): How long to rest between exercises
3. **Total time** (seconds): Total duration of your workout

### Example

```
Action/Exercise time (seconds): 30
Rest time (seconds): 15
Total workout time (seconds): 300
```

This creates a workout with:
- 30 seconds of action
- 15 seconds of rest
- Total of 300 seconds (5 minutes)
- ~5 complete cycles before time expires

## During Workout

The timer displays:
- **Total Time Remaining**: Countdown for entire workout
- **Cycles Completed**: Number of complete action+rest cycles
- **Current Phase**: Whether you're in ACTION or REST phase
- **Phase Time**: Countdown for current phase

Audio and visual alerts notify you of phase transitions.

## Stopping the Workout

Press **Ctrl+C** at any time to stop the timer. Your progress will be displayed.

## How It Works

1. **Prompt for times**: Enter action duration, rest duration, and total workout time
2. **Start countdown**: Timer begins after 3-second countdown
3. **Action phase**: Exercise for the set duration
4. **Rest phase**: Rest for the set duration
5. **Repeat**: Continues alternating until total time expires
6. **Complete**: Displays completion message and statistics

The timer ensures that your entire workout never exceeds the total time you specified.

## Example Workouts

### Quick HIIT (5 minutes)
- Action: 20 seconds
- Rest: 10 seconds
- Total: 300 seconds

### Standard Interval (10 minutes)
- Action: 30 seconds
- Rest: 30 seconds
- Total: 600 seconds

### Long Endurance (20 minutes)
- Action: 60 seconds
- Rest: 40 seconds
- Total: 1200 seconds

## Tips

- **Start small**: Begin with shorter intervals to test the timer
- **Adjust difficulty**: Increase action time or decrease rest time as you get stronger
- **Track progress**: Note how many cycles you complete each session
- **Mix it up**: Try different interval combinations to challenge yourself

Enjoy your workout! 💪
