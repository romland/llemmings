/*
>>> Prompt: instructions/audio-tracker.0001-failed.txt
>>> Prompt: instructions/audio-tracker.0002-failed.txt
>>> Prompt: instructions/audio-tracker.0003-failed.txt
>>> Prompt: instructions/audio-tracker.0004.txt
*/
/* HUMAN notes: 
- The structure of a tune:
    const tune = {
        // Samples that are used in this tune, e.g. Instrument.Piano-Octave.4-Note.C-0.25.seconds
        samples: [ "PN-4-C-0.25", "PN-4-C#-0.25", "BD-0.25" ],
        // Refers to samples above
        patterns: [
            [ 0, 1, , , 0, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ],
            [ 1, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ],
            [ 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,],
        ],
        // Refers to patterns above
        patternGroups: [
            { tempo: 30, channels: [ 0, 1, 2, null ] },
            { tempo: 120, channels: [ 0, 2, 1, 2 ] },
        ],
    };
- This tracker is not great. Especially the way timing works. There will be updates.
- It depends on audio-samples.js for playSample()
- You should generate the samples in the tune use prior to calling playTune, the functionality
  for this sits in audio-samples.js. It will populate the samples array in there.
*/
var AudioTracker = (function ()
{
    function playTune(tune) {
        let currentPatternIndex = 0;
        let currentStepIndex = 0;
        let currentStepTime = 0;
        let currentGroupIndex = 0;
        let currentTempo = tune.patternGroups[0].tempo;
        let currentChannels = tune.patternGroups[0].channels;
        
        function playStep() {
            currentChannels.forEach((patternIndex) => {
                const pattern = tune.patterns[patternIndex];
                if(!pattern) return;
                const sampleIndex = pattern[currentStepIndex];
                
                if (sampleIndex != null) {
                    const sampleName = tune.samples[sampleIndex];
                    AudioSamples.playSample(sampleName);
                }
            });
            
            currentStepIndex++;
            currentStepTime = 60000 / (currentTempo * 4);
            
            if (currentStepIndex >= 64) {
                currentStepIndex = 0;
                currentPatternIndex++;
                
                if (currentPatternIndex >= currentChannels.length) {
                    currentPatternIndex = 0;
                    currentGroupIndex++;
                    
                    if (currentGroupIndex >= tune.patternGroups.length) {
                        return;
                    }
                    
                    currentTempo = tune.patternGroups[currentGroupIndex].tempo;
                    currentChannels = tune.patternGroups[currentGroupIndex].channels;
                }
            }
            
            setTimeout(() => {
                requestAnimationFrame(playStep);
            }, currentStepTime);
        }
        
        requestAnimationFrame(playStep);
    }
    
    return {
        playTune : playTune,
        createSamplesPerInstrumentPerNotePerOctave : createSamplesPerInstrumentPerNotePerOctave,
    }
})();
