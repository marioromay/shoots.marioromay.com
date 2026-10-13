// Each complete row fills its available width without cropping or changing order.
export function justifiedRows(ratios,width,gap,target){
 if(width<=0)return [];
 const rows=[];let indices=[],sum=0;
 const flush=(last=false)=>{const available=Math.max(1,width-gap*(indices.length-1));rows.push({indices,height:Math.min(last?target:Infinity,available/sum)});indices=[];sum=0};
 ratios.forEach((ratio,index)=>{indices.push(index);sum+=ratio;if(sum*target+gap*(indices.length-1)>=width)flush()});
 if(indices.length)flush(true);
 return rows;
}
