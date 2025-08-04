import React from "react";
import { ScriptFromProps } from "../../types/common";

export default function ScriptForm({ data, setData } : ScriptFromProps) {
  return (
    <div className="h-full w-full">
      <textarea
        className="h-full w-full p-4 border rounded-lg resize-none"
        placeholder="Please input the script with script type (etc. .srt)"
        value={data.script}
        onChange={(e) => 
          setData({script: e.target.value})
          }
//         defaultValue={`

// 1
// 00:00:00,000 --> 00:00:05,000
// 화를 참는 것은 천재의 일이며, 화를 풀 때는 바보의 행위다.

// 2
// 00:05:00,000 --> 00:10:000
// 오늘, 우리는 모두 어떤 상황에서 화를 느끼게 되곤 합니다.

// 3
// 00:10:000 --> 00:15:000
// 하지만 우리는 그 화를 참고, 그 상황을 지혜롭게 해결해 나갈 수 있습니다.

// 4
// 00:15:000 --> 00:20:000
// 이 세상에는 이미 너무 많은 분노와 혼란이 넘쳐나고 있습니다.

// 5
// 00:20:000 --> 00:25:000
// 우리가 조금 더 참을성을 가지고, 서로를 이해하며 살아간다면

// 6
// 00:25:000 --> 00:30:000
// 어떤 어려움이든 헤쳐 나갈 수 있을 거라 믿습니다.

// 7
// 00:30:000 --> 00:35:000
// 오늘, 우리는 화를 참고 지혜롭게 행동하여

// 8
// 00:35:000 --> 00:40:000
// 더 나은 세상을 만들어 나갈 수 있습니다.

// 9
// 00:40:000 --> 00:45:000
// 한줄 교훈: 참을성을 키우고 지혜롭게 행동합시다.

// `
// }
      />
    </div>
  );
}