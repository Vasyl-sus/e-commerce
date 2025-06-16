import { useEffect, useMemo, useState } from "react";
import { parseLanguageModules } from '../components/services.js'

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export const Timer = ({ deadline = new Date().toString(), lang }) => {
    const parsedDeadline = useMemo(() => Date.parse(deadline), [deadline]);
    const [time, setTime] = useState(parsedDeadline - Date.now());

    useEffect(() => {
        const interval = setInterval(
            () => setTime(parsedDeadline - Date.now()),
            1000,
        );

        return () => clearInterval(interval);
    }, [parsedDeadline]);

    const langs = {
        day: {
            sl: [
                'dni',
                'dni',
                'dni',
                'dneva',
                'dan'
            ],
            cs: [
                'dní',
                'dny',
                'dny',
                'dny',
                'den'
            ],
            hu: [
                'nap',
                'nap',
                'nap',
                'nap',
                'nap'
            ],
            hr: [
                'dana',
                'dana',
                'dana',
                'dana',
                'dan'
            ],
            sk: [
                'dní',
                'dni',
                'dni',
                'dni',
                'deň'
            ]
        },
        h: {
            sl: [
                'ur',
                'ur',
                'ure',
                'uri',
                'uro'
            ],
            cs: [
                'hodin',
                'hodiny',
                'hodiny',
                'hodiny',
                'hodinu'
            ],
            hu: [
                'óra',
                'óra',
                'óra',
                'óra',
                'óra'
            ],
            hr: [
                'sati',
                'sati',
                'sata',
                'sata',
                'sat'
            ],
            sk: [
                'hodín',
                'hodiny',
                'hodiny',
                'hodiny',
                'hodinu'
            ]
        },
        min: {
            sl: [
                'minut',
                'minut',
                'minute',
                'minuti',
                'minuto'
            ],
            cs: [
                'minut',
                'minuty',
                'minuty',
                'minuty',
                'minutu'
            ],
            hu: [
                'perc',
                'perc',
                'perc',
                'perc',
                'perc'
            ],
            hr: [
                'minuta',
                'minuta',
                'minute',
                'minute',
                'minutu'
            ],
            sk: [
                'minút',
                'minúty',
                'minúty',
                'minúty',
                'minútu'
            ]
        },
        sec: {
            sl: [
                'sekund',
                'sekund',
                'sekunde',
                'sekundi',
                'sekundo'
            ],
            cs: [
                'vteřin',
                'vteřiny',
                'vteřiny',
                'vteřiny',
                'vteřinu'
            ],
            hu: [
                'másodperc',
                'másodperc',
                'másodperc',
                'másodperc',
                'másodperc'
            ],
            hr: [
                'sekundi',
                'sekundi',
                'sekunde',
                'sekunde',
                'sekundu'
            ],
            sk: [
                'sekúnd',
                'sekundy',
                'sekundy',
                'sekundy',
                'sekundu'
            ]
        },
    }

    return (
        <div className="timer row">
            {Object.entries({
                day: time / DAY,
                h: (time / HOUR) % 24,
                min: (time / MINUTE) % 60,
                sec: (time / SECOND) % 60,
            }).map(([label, value]) => (
                <div key={label} className="col-3">
                    <div className="box">
                        <p className="timer-number">{`${Math.floor(value)}`.padStart(2, "0")}</p>
                        <span className="text">
                            {Math.floor(value) > 4 && langs[label][lang] && langs[label][lang][0]}
                            {Math.floor(value) > 3 && Math.floor(value) < 5 && langs[label][lang] && langs[label][lang][1]}
                            {Math.floor(value) > 2 && Math.floor(value) < 4 && langs[label][lang] && langs[label][lang][2]}
                            {Math.floor(value) > 1 && Math.floor(value) < 3 && langs[label][lang] && langs[label][lang][3]}
                            {Math.floor(value) > 0 && Math.floor(value) < 2 && langs[label][lang] && langs[label][lang][4]}
                            {Math.floor(value) < 1 && langs[label][lang] && langs[label][lang][0]}
                        </span>
                        {/* <span className="text">{label}</span> */}
                    </div>
                </div>
            ))}
        </div>
    );
};
