/// ADDTIME function: adds a range of cells  
///    Usage:   =ADDTIME(range)
///    Example: =ADDTIME(A1:A36) 
function ADDTIME(times) {
    return AdderOfTime.calc(
        times.map(t=>t.filter(t=>t).join("+")).filter(t=>t).join("+"), 
        BigInt(30)
    ).answers.join(",\n");
}

/// SUBTIME function: subtract 2 cells
///    Usage:   =SUBTIME(cell1, cell2)
///    Example: =SUBTIME(A1, B2)
function SUBTIME(time1, time2){
    var r = AdderOfTime.calc(time1+"-"+time2, BigInt(30));
    return r.answers.join(",\n");
}

/// DIVTIME function: divide 2 times
///    Usage:   =DIVTIME(cell, divisor)
///    Example: =DIVTIME(A1, B2)
function DIVTIME(time1, time2){
    var r = AdderOfTime.ratio(time1, time2, BigInt(30));
    return r;
}

/// https://github.com/Pistonite/addtime
