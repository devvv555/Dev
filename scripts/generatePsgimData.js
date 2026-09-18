const fs = require('fs');
const path = require('path');

const rawLines = `
D26AA01 MCOB1 ADM1 MC2 SSM1 BS1 EDM3 LA1 SSA3
D26AA02 MCOB2 ADM1 MC1 SSM1 BS2 EDM2 LA3 SSA1
D26AA03 MCOB3 ADM1 MC3 SSM1 BS3 EDM1 LA1 SSA3
D26AA04 MCOB4 ADM1 MC4 SSM1 BS1 EDM2 LA3 SSA1
D26AA05 MCOB1 ADM2 MC3 SSM1 BS2 EDM1 LA1 SSA3
D26AA06 MCOB2 ADM2 MC4 SSM1 BS3 EDM1 LA3 SSA1
D26AA07 MCOB3 ADM2 MC2 SSM1 BS1 EDM2 LA1 SSA3
D26AA08 MCOB4 ADM2 MC1 SSM1 BS2 EDM3 LA3 SSA1
D26AA09 MCOB1 ADM3 MC2 SSM1 BS3 EDM3 LA1 SSA3
D26AA10 MCOB2 ADM3 MC1 SSM1 BS1 EDM3 LA3 SSA1
D26AA11 MCOB3 ADM3 MC3 SSM1 BS2 EDM2 LA1 SSA3
D26AA12 MCOB4 ADM3 MC4 SSM1 BS3 EDM1 LA3 SSA1
D26AA13 MCOB1 ADM4 MC3 SSM1 BS1 EDM2 LA1 SSA3
D26AA14 MCOB2 ADM4 MC4 SSM1 BS2 EDM1 LA3 SSA1
D26AA15 MCOB3 ADM4 MC2 SSM1 BS3 EDM1 LA1 SSA4
D26AA16 MCOB4 ADM4 MC1 SSM1 BS1 EDM2 LA3 SSA1
D26AA17 MCOB1 ADM1 MC2 SSM1 BS2 EDM3 LA1 SSA4
D26AA18 MCOB2 ADM1 MC1 SSM1 BS3 EDM3 LA4 SSA1
D26AA19 MCOB3 ADM1 MC3 SSM1 BS1 EDM3 LA1 SSA4
D26AA20 MCOB4 ADM1 MC4 SSM1 BS2 EDM2 LA4 SSA1
D26AA21 MCOB1 ADM2 MC3 SSM1 BS3 EDM1 LA1 SSA4
D26AA22 MCOB2 ADM2 MC4 SSM1 BS1 EDM2 LA4 SSA1
D26AA23 MCOB3 ADM2 MC2 SSM1 BS2 EDM1 LA1 SSA4
D26AA24 MCOB4 ADM2 MC1 SSM1 BS3 EDM1 LA4 SSA1
D26AA25 MCOB1 ADM3 MC2 SSM1 BS1 EDM2 LA1 SSA4
D26AA26 MCOB2 ADM3 MC1 SSM1 BS2 EDM3 LA4 SSA1
D26AA27 MCOB3 ADM3 MC3 SSM1 BS3 EDM3 LA1 SSA4
D26AA28 MCOB4 ADM3 MC4 SSM1 BS1 EDM3 LA4 SSA1
D26AA29 MCOB1 ADM4 MC3 SSM1 BS2 EDM2 LA1 SSA4
D26AA30 MCOB2 ADM4 MC4 SSM1 BS3 EDM1 LA4 SSA1
D26AA31 MCOB3 ADM4 MC2 SSM1 BS1 EDM2 LA2 SSA3
D26AA32 MCOB4 ADM4 MC1 SSM1 BS2 EDM1 LA3 SSA2
D26AA33 MCOB1 ADM1 MC2 SSM1 BS3 EDM1 LA2 SSA3
D26AA34 MCOB2 ADM1 MC1 SSM1 BS1 EDM2 LA3 SSA2
D26AA35 MCOB3 ADM1 MC3 SSM1 BS2 EDM3 LA2 SSA3
D26AA36 MCOB4 ADM1 MC4 SSM1 BS3 EDM3 LA3 SSA2
D26AA37 MCOB1 ADM2 MC3 SSM1 BS1 EDM3 LA2 SSA3
D26AA38 MCOB2 ADM2 MC4 SSM1 BS2 EDM2 LA3 SSA2
D26AA39 MCOB3 ADM2 MC2 SSM1 BS3 EDM1 LA2 SSA3
D26AA40 MCOB4 ADM2 MC1 SSM1 BS1 EDM2 LA3 SSA2
D26AA41 MCOB1 ADM3 MC2 SSM1 BS2 EDM1 LA2 SSA3
D26AA42 MCOB2 ADM3 MC1 SSM1 BS3 EDM1 LA3 SSA2
D26AA43 MCOB3 ADM3 MC3 SSM1 BS1 EDM2 LA2 SSA3
D26AA44 MCOB4 ADM3 MC4 SSM1 BS2 EDM3 LA3 SSA2
D26AA45 MCOB1 ADM4 MC3 SSM1 BS3 EDM3 LA2 SSA3
D26AA46 MCOB2 ADM4 MC4 SSM1 BS4 EDM4 LA4 SSA2
D26AA47 MCOB3 ADM4 MC2 SSM1 BS4 EDM4 LA2 SSA4
D26AA48 MCOB4 ADM4 MC1 SSM1 BS4 EDM4 LA4 SSA2
D26AA49 MCOB1 ADM1 MC2 SSM1 BS4 EDM4 LA2 SSA4
D26AA50 MCOB2 ADM1 MC1 SSM1 BS4 EDM4 LA4 SSA2
D26AA51 MCOB3 ADM1 MC3 SSM1 BS4 EDM4 LA2 SSA4
D26AA52 MCOB4 ADM2 MC4 SSM1 BS4 EDM4 LA4 SSA2
D26AA53 MCOB1 ADM2 MC3 SSM1 BS4 EDM4 LA2 SSA4
D26AA54 MCOB2 ADM2 MC4 SSM1 BS4 EDM4 LA4 SSA2
D26AA55 MCOB3 ADM3 MC2 SSM1 BS4 EDM4 LA2 SSA4
D26AA56 MCOB4 ADM3 MC1 SSM1 BS4 EDM4 LA4 SSA2
D26AA57 MCOB1 ADM3 MC2 SSM1 BS4 EDM4 LA2 SSA4
D26AA58 MCOB2 ADM4 MC1 SSM1 BS4 EDM4 LA4 SSA2
D26AA59 MCOB3 ADM4 MC3 SSM1 BS4 EDM4 LA2 SSA4
D26AA60 MCOB4 ADM4 MC4 SSM1 BS4 EDM4 LA4 SSA2
D26AB01 MCOB1 ADM1 MC2 SSM2 BS1 EDM3 LA1 SSA3
D26AB02 MCOB2 ADM1 MC1 SSM2 BS2 EDM2 LA3 SSA1
D26AB03 MCOB3 ADM1 MC3 SSM2 BS3 EDM1 LA1 SSA3
D26AB04 MCOB4 ADM1 MC4 SSM2 BS1 EDM2 LA3 SSA1
D26AB05 MCOB1 ADM2 MC3 SSM2 BS2 EDM1 LA1 SSA3
D26AB06 MCOB2 ADM2 MC4 SSM2 BS3 EDM1 LA3 SSA1
D26AB07 MCOB3 ADM2 MC2 SSM2 BS1 EDM2 LA1 SSA3
D26AB08 MCOB4 ADM2 MC1 SSM2 BS2 EDM3 LA3 SSA1
D26AB09 MCOB1 ADM3 MC2 SSM2 BS3 EDM3 LA1 SSA3
D26AB10 MCOB2 ADM3 MC1 SSM2 BS1 EDM3 LA3 SSA1
D26AB11 MCOB3 ADM3 MC3 SSM2 BS2 EDM2 LA1 SSA3
D26AB12 MCOB4 ADM3 MC4 SSM2 BS3 EDM1 LA3 SSA1
D26AB13 MCOB1 ADM4 MC3 SSM2 BS1 EDM2 LA1 SSA3
D26AB14 MCOB2 ADM4 MC4 SSM2 BS2 EDM1 LA3 SSA1
D26AB15 MCOB3 ADM4 MC2 SSM2 BS3 EDM1 LA1 SSA4
D26AB16 MCOB4 ADM4 MC1 SSM2 BS1 EDM2 LA3 SSA1
D26AB17 MCOB1 ADM1 MC2 SSM2 BS2 EDM3 LA1 SSA4
D26AB18 MCOB2 ADM1 MC1 SSM2 BS3 EDM3 LA4 SSA1
D26AB19 MCOB3 ADM1 MC3 SSM2 BS1 EDM3 LA1 SSA4
D26AB20 MCOB4 ADM1 MC4 SSM2 BS2 EDM2 LA4 SSA1
D26AB21 MCOB1 ADM2 MC3 SSM2 BS3 EDM1 LA1 SSA4
D26AB22 MCOB2 ADM2 MC4 SSM2 BS1 EDM2 LA4 SSA1
D26AB23 MCOB3 ADM2 MC2 SSM2 BS2 EDM1 LA1 SSA4
D26AB24 MCOB4 ADM2 MC1 SSM2 BS3 EDM1 LA4 SSA1
D26AB25 MCOB1 ADM3 MC2 SSM2 BS1 EDM2 LA1 SSA4
D26AB26 MCOB2 ADM3 MC1 SSM2 BS2 EDM3 LA4 SSA1
D26AB27 MCOB3 ADM3 MC3 SSM2 BS3 EDM3 LA1 SSA4
D26AB28 MCOB4 ADM3 MC4 SSM2 BS1 EDM3 LA4 SSA1
D26AB29 MCOB1 ADM4 MC3 SSM2 BS2 EDM2 LA1 SSA4
D26AB30 MCOB2 ADM4 MC4 SSM2 BS3 EDM1 LA4 SSA1
D26AB31 MCOB3 ADM4 MC2 SSM2 BS1 EDM2 LA2 SSA3
D26AB32 MCOB4 ADM4 MC1 SSM2 BS2 EDM1 LA3 SSA2
D26AB33 MCOB1 ADM1 MC2 SSM2 BS3 EDM1 LA2 SSA3
D26AB34 MCOB2 ADM1 MC1 SSM2 BS1 EDM2 LA3 SSA2
D26AB35 MCOB3 ADM1 MC3 SSM2 BS2 EDM3 LA2 SSA3
D26AB36 MCOB4 ADM1 MC4 SSM2 BS3 EDM3 LA3 SSA2
D26AB37 MCOB1 ADM2 MC3 SSM2 BS1 EDM3 LA2 SSA3
D26AB38 MCOB2 ADM2 MC4 SSM2 BS2 EDM2 LA3 SSA2
D26AB39 MCOB3 ADM2 MC2 SSM2 BS3 EDM1 LA2 SSA3
D26AB40 MCOB4 ADM2 MC1 SSM2 BS1 EDM2 LA3 SSA2
D26AB41 MCOB1 ADM3 MC2 SSM2 BS2 EDM1 LA2 SSA3
D26AB42 MCOB2 ADM3 MC1 SSM2 BS3 EDM1 LA3 SSA2
D26AB43 MCOB3 ADM3 MC3 SSM2 BS1 EDM2 LA2 SSA3
D26AB44 MCOB4 ADM3 MC4 SSM2 BS2 EDM3 LA3 SSA2
D26AB45 MCOB1 ADM4 MC3 SSM2 BS3 EDM3 LA2 SSA3
D26AB46 MCOB2 ADM4 MC4 SSM2 BS4 EDM4 LA4 SSA2
D26AB47 MCOB3 ADM4 MC2 SSM2 BS4 EDM4 LA2 SSA4
D26AB48 MCOB4 ADM4 MC1 SSM2 BS4 EDM4 LA4 SSA2
D26AB49 MCOB1 ADM1 MC2 SSM2 BS4 EDM4 LA2 SSA4
D26AB50 MCOB2 ADM1 MC1 SSM2 BS4 EDM4 LA4 SSA2
D26AB51 MCOB3 ADM1 MC3 SSM2 BS4 EDM4 LA2 SSA4
D26AB52 MCOB4 ADM2 MC4 SSM2 BS4 EDM4 LA4 SSA2
D26AB53 MCOB1 ADM2 MC3 SSM2 BS4 EDM4 LA2 SSA4
D26AB54 MCOB2 ADM2 MC4 SSM2 BS4 EDM4 LA4 SSA2
D26AB55 MCOB3 ADM3 MC2 SSM2 BS4 EDM4 LA2 SSA4
D26AB56 MCOB4 ADM3 MC1 SSM2 BS4 EDM4 LA4 SSA2
D26AB57 MCOB1 ADM3 MC2 SSM2 BS4 EDM4 LA2 SSA4
D26AB58 MCOB2 ADM4 MC1 SSM2 BS4 EDM4 LA4 SSA2
D26AB59 MCOB3 ADM4 MC3 SSM2 BS4 EDM4 LA2 SSA4
D26AB60 MCOB4 ADM4 MC4 SSM2 BS4 EDM4 LA4 SSA2
D26AC01 MCOB1 ADM1 MC2 SSM3 BS1 EDM3 LA1 SSA3
D26AC02 MCOB2 ADM1 MC1 SSM3 BS2 EDM2 LA3 SSA1
D26AC03 MCOB3 ADM1 MC3 SSM3 BS3 EDM1 LA1 SSA3
D26AC04 MCOB4 ADM1 MC4 SSM3 BS1 EDM2 LA3 SSA1
D26AC05 MCOB1 ADM2 MC3 SSM3 BS2 EDM1 LA1 SSA3
D26AC06 MCOB2 ADM2 MC4 SSM3 BS3 EDM1 LA3 SSA1
D26AC07 MCOB3 ADM2 MC2 SSM3 BS1 EDM2 LA1 SSA3
D26AC08 MCOB4 ADM2 MC1 SSM3 BS2 EDM3 LA3 SSA1
D26AC09 MCOB1 ADM3 MC2 SSM3 BS3 EDM3 LA1 SSA3
D26AC10 MCOB2 ADM3 MC1 SSM3 BS1 EDM3 LA3 SSA1
D26AC11 MCOB3 ADM3 MC3 SSM3 BS2 EDM2 LA1 SSA3
D26AC12 MCOB4 ADM3 MC4 SSM3 BS3 EDM1 LA3 SSA1
D26AC13 MCOB1 ADM4 MC3 SSM3 BS1 EDM2 LA1 SSA3
D26AC14 MCOB2 ADM4 MC4 SSM3 BS2 EDM1 LA3 SSA1
D26AC15 MCOB3 ADM4 MC2 SSM3 BS3 EDM1 LA1 SSA4
D26AC16 MCOB4 ADM4 MC1 SSM3 BS1 EDM2 LA3 SSA1
D26AC17 MCOB1 ADM1 MC2 SSM3 BS2 EDM3 LA1 SSA4
D26AC18 MCOB2 ADM1 MC1 SSM3 BS3 EDM3 LA4 SSA1
D26AC19 MCOB3 ADM1 MC3 SSM3 BS1 EDM3 LA1 SSA4
D26AC20 MCOB4 ADM1 MC4 SSM3 BS2 EDM2 LA4 SSA1
D26AC21 MCOB1 ADM2 MC3 SSM3 BS3 EDM1 LA1 SSA4
D26AC22 MCOB2 ADM2 MC4 SSM3 BS1 EDM2 LA4 SSA1
D26AC23 MCOB3 ADM2 MC2 SSM3 BS2 EDM1 LA1 SSA4
D26AC24 MCOB4 ADM2 MC1 SSM3 BS3 EDM1 LA4 SSA1
D26AC25 MCOB1 ADM3 MC2 SSM3 BS1 EDM2 LA1 SSA4
D26AC26 MCOB2 ADM3 MC1 SSM3 BS2 EDM3 LA4 SSA1
D26AC27 MCOB3 ADM3 MC3 SSM3 BS3 EDM3 LA1 SSA4
D26AC28 MCOB4 ADM3 MC4 SSM3 BS1 EDM3 LA4 SSA1
D26AC29 MCOB1 ADM4 MC3 SSM3 BS2 EDM2 LA1 SSA4
D26AC30 MCOB2 ADM4 MC4 SSM3 BS3 EDM1 LA4 SSA1
D26AC31 MCOB3 ADM4 MC2 SSM3 BS1 EDM2 LA2 SSA3
D26AC32 MCOB4 ADM4 MC1 SSM3 BS2 EDM1 LA3 SSA2
D26AC33 MCOB1 ADM1 MC2 SSM3 BS3 EDM1 LA2 SSA3
D26AC34 MCOB2 ADM1 MC1 SSM3 BS1 EDM2 LA3 SSA2
D26AC35 MCOB3 ADM1 MC3 SSM3 BS2 EDM3 LA2 SSA3
D26AC36 MCOB4 ADM1 MC4 SSM3 BS3 EDM3 LA3 SSA2
D26AC37 MCOB1 ADM2 MC3 SSM3 BS1 EDM3 LA2 SSA3
D26AC38 MCOB2 ADM2 MC4 SSM3 BS2 EDM2 LA3 SSA2
D26AC39 MCOB3 ADM2 MC2 SSM3 BS3 EDM1 LA2 SSA3
D26AC40 MCOB4 ADM2 MC1 SSM3 BS1 EDM2 LA3 SSA2
D26AC41 MCOB1 ADM3 MC2 SSM3 BS2 EDM1 LA2 SSA3
D26AC42 MCOB2 ADM3 MC1 SSM3 BS3 EDM1 LA3 SSA2
D26AC43 MCOB3 ADM3 MC3 SSM3 BS1 EDM2 LA2 SSA3
D26AC44 MCOB4 ADM3 MC4 SSM3 BS2 EDM3 LA3 SSA2
D26AC45 MCOB1 ADM4 MC3 SSM3 BS3 EDM3 LA2 SSA3
D26AC46 MCOB2 ADM4 MC4 SSM3 BS4 EDM4 LA4 SSA2
D26AC47 MCOB3 ADM4 MC2 SSM3 BS4 EDM4 LA2 SSA4
D26AC48 MCOB4 ADM4 MC1 SSM3 BS4 EDM4 LA4 SSA2
D26AC49 MCOB1 ADM1 MC2 SSM3 BS4 EDM4 LA2 SSA4
D26AC50 MCOB2 ADM1 MC1 SSM3 BS4 EDM4 LA4 SSA2
D26AC51 MCOB3 ADM1 MC3 SSM3 BS4 EDM4 LA2 SSA4
D26AC52 MCOB4 ADM2 MC4 SSM3 BS4 EDM4 LA4 SSA2
D26AC53 MCOB1 ADM2 MC3 SSM3 BS4 EDM4 LA2 SSA4
D26AC54 MCOB2 ADM2 MC4 SSM3 BS4 EDM4 LA4 SSA2
D26AC55 MCOB3 ADM3 MC2 SSM3 BS4 EDM4 LA2 SSA4
D26AC56 MCOB4 ADM3 MC1 SSM3 BS4 EDM4 LA4 SSA2
D26AC57 MCOB1 ADM3 MC2 SSM3 BS4 EDM4 LA2 SSA4
D26AC58 MCOB2 ADM4 MC1 SSM3 BS4 EDM4 LA4 SSA2
D26AC59 MCOB3 ADM4 MC3 SSM3 BS4 EDM4 LA2 SSA4
D26AC60 MCOB4 ADM4 MC4 SSM3 BS4 EDM4 LA4 SSA2
D26AD01 MCOB1 ADM1 MC2 SSM4 BS1 EDM3 LA1 SSA3
D26AD02 MCOB2 ADM1 MC1 SSM4 BS2 EDM2 LA3 SSA1
D26AD03 MCOB3 ADM1 MC3 SSM4 BS3 EDM1 LA1 SSA3
D26AD04 MCOB4 ADM1 MC4 SSM4 BS1 EDM2 LA3 SSA1
D26AD05 MCOB1 ADM2 MC3 SSM4 BS2 EDM1 LA1 SSA3
D26AD06 MCOB2 ADM2 MC4 SSM4 BS3 EDM1 LA3 SSA1
D26AD07 MCOB3 ADM2 MC2 SSM4 BS1 EDM2 LA1 SSA3
D26AD08 MCOB4 ADM2 MC1 SSM4 BS2 EDM3 LA3 SSA1
D26AD09 MCOB1 ADM3 MC2 SSM4 BS3 EDM3 LA1 SSA3
D26AD10 MCOB2 ADM3 MC1 SSM4 BS1 EDM3 LA3 SSA1
D26AD11 MCOB3 ADM3 MC3 SSM4 BS2 EDM2 LA1 SSA3
D26AD12 MCOB4 ADM3 MC4 SSM4 BS3 EDM1 LA3 SSA1
D26AD13 MCOB1 ADM4 MC3 SSM4 BS1 EDM2 LA1 SSA3
D26AD14 MCOB2 ADM4 MC4 SSM4 BS2 EDM1 LA3 SSA1
D26AD15 MCOB3 ADM4 MC2 SSM4 BS3 EDM1 LA1 SSA4
D26AD16 MCOB4 ADM4 MC1 SSM4 BS1 EDM2 LA3 SSA1
D26AD17 MCOB1 ADM1 MC2 SSM4 BS2 EDM3 LA1 SSA4
D26AD18 MCOB2 ADM1 MC1 SSM4 BS3 EDM3 LA4 SSA1
D26AD19 MCOB3 ADM1 MC3 SSM4 BS1 EDM3 LA1 SSA4
D26AD20 MCOB4 ADM1 MC4 SSM4 BS2 EDM2 LA4 SSA1
D26AD21 MCOB1 ADM2 MC3 SSM4 BS3 EDM1 LA1 SSA4
D26AD22 MCOB2 ADM2 MC4 SSM4 BS1 EDM2 LA4 SSA1
D26AD23 MCOB3 ADM2 MC2 SSM4 BS2 EDM1 LA1 SSA4
D26AD24 MCOB4 ADM2 MC1 SSM4 BS3 EDM1 LA4 SSA1
D26AD25 MCOB1 ADM3 MC2 SSM4 BS1 EDM2 LA1 SSA4
D26AD26 MCOB2 ADM3 MC1 SSM4 BS2 EDM3 LA4 SSA1
D26AD27 MCOB3 ADM3 MC3 SSM4 BS3 EDM3 LA1 SSA4
D26AD28 MCOB4 ADM3 MC4 SSM4 BS1 EDM3 LA4 SSA1
D26AD29 MCOB1 ADM4 MC3 SSM4 BS2 EDM2 LA1 SSA4
D26AD30 MCOB2 ADM4 MC4 SSM4 BS3 EDM1 LA4 SSA1
D26AD31 MCOB3 ADM4 MC2 SSM4 BS1 EDM2 LA2 SSA3
D26AD32 MCOB4 ADM4 MC1 SSM4 BS2 EDM1 LA3 SSA2
D26AD33 MCOB1 ADM1 MC2 SSM4 BS3 EDM1 LA2 SSA3
D26AD34 MCOB2 ADM1 MC1 SSM4 BS1 EDM2 LA3 SSA2
D26AD35 MCOB3 ADM1 MC3 SSM4 BS2 EDM3 LA2 SSA3
D26AD36 MCOB4 ADM1 MC4 SSM4 BS3 EDM3 LA3 SSA2
D26AD37 MCOB1 ADM2 MC3 SSM4 BS1 EDM3 LA2 SSA3
D26AD38 MCOB2 ADM2 MC4 SSM4 BS2 EDM2 LA3 SSA2
D26AD39 MCOB3 ADM2 MC2 SSM4 BS3 EDM1 LA2 SSA3
D26AD40 MCOB4 ADM2 MC1 SSM4 BS1 EDM2 LA3 SSA2
D26AD41 MCOB1 ADM3 MC2 SSM4 BS2 EDM1 LA2 SSA3
D26AD42 MCOB2 ADM3 MC1 SSM4 BS3 EDM1 LA3 SSA2
D26AD43 MCOB3 ADM3 MC3 SSM4 BS1 EDM2 LA2 SSA3
D26AD44 MCOB4 ADM3 MC4 SSM4 BS2 EDM3 LA3 SSA2
D26AD45 MCOB1 ADM4 MC3 SSM4 BS3 EDM3 LA2 SSA3
D26AD46 MCOB2 ADM4 MC4 SSM4 BS4 EDM4 LA4 SSA2
D26AD47 MCOB3 ADM4 MC2 SSM4 BS4 EDM4 LA2 SSA4
D26AD48 MCOB4 ADM4 MC1 SSM4 BS4 EDM4 LA4 SSA2
D26AD49 MCOB1 ADM1 MC2 SSM4 BS4 EDM4 LA2 SSA4
D26AD50 MCOB2 ADM1 MC1 SSM4 BS4 EDM4 LA4 SSA2
D26AD51 MCOB3 ADM1 MC3 SSM4 BS4 EDM4 LA2 SSA4
D26AD52 MCOB4 ADM2 MC4 SSM4 BS4 EDM4 LA4 SSA2
D26AD53 MCOB1 ADM2 MC3 SSM4 BS4 EDM4 LA2 SSA4
D26AD54 MCOB2 ADM2 MC4 SSM4 BS4 EDM4 LA4 SSA2
D26AD55 MCOB3 ADM3 MC2 SSM4 BS4 EDM4 LA2 SSA4
D26AD56 MCOB4 ADM3 MC1 SSM4 BS4 EDM4 LA4 SSA2
D26AD57 MCOB1 ADM3 MC2 SSM4 BS4 EDM4 LA2 SSA4
D26AD58 MCOB2 ADM4 MC1 SSM4 BS4 EDM4 LA4 SSA2
D26AD59 MCOB3 ADM4 MC3 SSM4 BS4 EDM4 LA2 SSA4
D26AD60 MCOB4 ADM4 MC4 SSM4 BS4 EDM4 LA4 SSA2
D26AE01 MCOB1 ADM1 MC2 SSM1 BS1 EDM3 LA1 SSA3
D26AE02 MCOB2 ADM1 MC1 SSM2 BS2 EDM2 LA3 SSA1
D26AE03 MCOB3 ADM1 MC3 SSM3 BS3 EDM1 LA1 SSA3
D26AE04 MCOB4 ADM1 MC4 SSM4 BS1 EDM2 LA3 SSA1
D26AE05 MCOB1 ADM2 MC3 SSM2 BS2 EDM1 LA1 SSA3
D26AE06 MCOB2 ADM2 MC4 SSM3 BS3 EDM1 LA3 SSA1
D26AE07 MCOB3 ADM2 MC2 SSM4 BS1 EDM2 LA1 SSA3
D26AE08 MCOB4 ADM2 MC1 SSM1 BS2 EDM3 LA3 SSA1
D26AE09 MCOB1 ADM3 MC2 SSM4 BS3 EDM3 LA1 SSA3
D26AE11 MCOB3 ADM3 MC3 SSM3 BS2 EDM2 LA1 SSA3
D26AE12 MCOB4 ADM3 MC4 SSM3 BS3 EDM1 LA3 SSA1
D26AE13 MCOB1 ADM4 MC3 SSM2 BS1 EDM2 LA1 SSA3
`;

const students = {};

rawLines.trim().split('\n').forEach(line => {
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 9) {
    const [rollNo, mcob, adm, mc, ssm, bs, edm, la, ssa] = parts;
    const sec = rollNo.slice(3, 5); // AA, AB, AC, AD, AE
    let ssmBatch = '';
    let sportsBatch = '';

    if (sec === 'AA') {
      ssmBatch = 'SSM1';
      sportsBatch = 'SPORTS1';
    } else if (sec === 'AB') {
      ssmBatch = 'SSM2';
      sportsBatch = 'SPORTS2';
    } else if (sec === 'AC') {
      ssmBatch = 'SSM3';
      sportsBatch = 'SPORTS3';
    } else if (sec === 'AD') {
      ssmBatch = 'SSM4';
      sportsBatch = 'SPORTS4';
    } else {
      // For Section AE: No permanent class for SSM and Sports, leave blank
      ssmBatch = '';
      sportsBatch = '';
    }

    students[rollNo] = {
      rollNo,
      batches: {
        MCOB: mcob,
        ADM: adm,
        MC: mc,
        SSM: ssmBatch,
        BS: bs,
        EDM: edm,
        LA: la,
        SSA: ssa,
        SPORTS: sportsBatch
      }
    };
  }
});

const fileContent = `// PSG Institute of Management - Batch 2026-28 (Semester 1)
// Master Database: Courses, Faculty, Master Timetable & Dynamic Student Batch Mappings

export interface CourseDetail {
  code: string;
  title: string;
  shortForm: string;
  faculty: Record<number, string>;
  halls: string;
  color: string;
}

export const PSGIM_COURSES: Record<string, CourseDetail> = {
  MCOB: {
    code: '24GM11',
    title: 'Management Concepts and Organizational Behaviour',
    shortForm: 'MCOB',
    faculty: {
      1: 'Dr. M. Kirupa Priyadarshini',
      2: 'Dr. Vijaya Vardhan Manchala',
      3: 'Dr. R. Indumathy',
      4: 'Dr. N. Udayakumar'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#3B82F6'
  },
  EDM: {
    code: '24GM12',
    title: 'Economics for Decision Making',
    shortForm: 'EDM',
    faculty: {
      1: 'Dr. Sreeanandan',
      2: 'Dr. Aiswarya D Pillai',
      3: 'Dr. E. Sri Varshini',
      4: 'Dr. Sreeanandan'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#10B981'
  },
  ADM: {
    code: '24GM13',
    title: 'Accounting for Decision Making',
    shortForm: 'ADM',
    faculty: {
      1: 'Dr. J. Nancy Christina',
      2: 'Dr. D. Kavitha',
      3: 'Dr. Nithya',
      4: 'Dr. Aiswarya D Pillai'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#F59E0B'
  },
  BS: {
    code: '24GM14',
    title: 'Business Statistics',
    shortForm: 'BS',
    faculty: {
      1: 'Mr. T. Sathish',
      2: 'Dr. J. Sekkizhar',
      3: 'Dr. Ravi Shankar Jetti',
      4: 'Mr. T. Sathish'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#8B5CF6'
  },
  MC: {
    code: '24GM15',
    title: 'Managerial Communication',
    shortForm: 'MC',
    faculty: {
      1: 'Dr. R. Deepa',
      2: 'Dr. R. Indumathy',
      3: 'Dr. E. Sri Varshini',
      4: 'Dr. Chenna Upendra'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#EC4899'
  },
  SSA: {
    code: '24GM16',
    title: 'Spreadsheet Applications',
    shortForm: 'SSA',
    faculty: {
      1: 'Mr. G. Kangasabapathy',
      2: 'Mr. Imayavendan',
      3: 'Mr. G. Kangasabapathy',
      4: 'Mr. Imayavendan'
    },
    halls: '401 / 405 / 101 / 109',
    color: '#06B6D4'
  },
  SSM: {
    code: '24GM18',
    title: 'Social Sensitization for Managers',
    shortForm: 'SSM',
    faculty: {
      1: 'Dr. D. Kavitha',
      2: 'Ms. C. Dhanya',
      3: 'Ms. Kanagathara',
      4: 'Dr. Venkatalakshmi'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#14B8A6'
  },
  LA: {
    code: '24GM19',
    title: 'Legal Aspects of Business',
    shortForm: 'LA',
    faculty: {
      1: 'Ms. C. Dhanya',
      2: 'Ms. C. Dhanya',
      3: 'Ms. C. Dhanya',
      4: 'Dr. Firdaus Bashir'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#F97316'
  },
  SPORTS: {
    code: 'SPORTS',
    title: 'Physical Education & Sports',
    shortForm: 'SPORTS',
    faculty: {
      1: 'Mr. Zakeer Khan',
      2: 'Mr. Zakeer Khan',
      3: 'Mr. Zakeer Khan',
      4: 'Mr. Zakeer Khan'
    },
    halls: 'Sports Ground',
    color: '#6366F1'
  }
};

export interface MasterScheduleSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  course: string;
  applicableBatches: string[]; // e.g. ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4']
  defaultRoom: string;
}

export const MASTER_SCHEDULE: MasterScheduleSlot[] = [
  // MONDAY
  { day: 'Monday', startTime: '08:30', endTime: '10:20', course: 'LA', applicableBatches: ['LA1'], defaultRoom: 'LH-101' },
  { day: 'Monday', startTime: '08:30', endTime: '10:20', course: 'SSA', applicableBatches: ['SSA1', 'SSA2'], defaultRoom: 'LH-401/405' },
  { day: 'Monday', startTime: '10:40', endTime: '12:30', course: 'ADM', applicableBatches: ['ADM1', 'ADM2', 'ADM3', 'ADM4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Monday', startTime: '13:40', endTime: '15:30', course: 'BS', applicableBatches: ['BS1', 'BS2', 'BS3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Monday', startTime: '13:40', endTime: '15:30', course: 'EDM', applicableBatches: ['EDM4'], defaultRoom: 'LH-405' },
  { day: 'Monday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM4'], defaultRoom: 'LH-405' },
  { day: 'Monday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS2'], defaultRoom: 'Ground' },

  // TUESDAY
  { day: 'Tuesday', startTime: '08:30', endTime: '10:20', course: 'MCOB', applicableBatches: ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Tuesday', startTime: '10:40', endTime: '12:30', course: 'EDM', applicableBatches: ['EDM1', 'EDM2', 'EDM3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Tuesday', startTime: '10:40', endTime: '12:30', course: 'BS', applicableBatches: ['BS4'], defaultRoom: 'LH-405' },
  { day: 'Tuesday', startTime: '13:40', endTime: '15:30', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Tuesday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM2'], defaultRoom: 'LH-109' },
  { day: 'Tuesday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS4'], defaultRoom: 'Ground' },

  // WEDNESDAY
  { day: 'Wednesday', startTime: '08:30', endTime: '10:20', course: 'BS', applicableBatches: ['BS1', 'BS2', 'BS3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Wednesday', startTime: '08:30', endTime: '10:20', course: 'EDM', applicableBatches: ['EDM4'], defaultRoom: 'LH-405' },
  { day: 'Wednesday', startTime: '10:40', endTime: '12:30', course: 'MCOB', applicableBatches: ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Wednesday', startTime: '13:40', endTime: '15:30', course: 'SSA', applicableBatches: ['SSA3', 'SSA4'], defaultRoom: 'LH-101/109' },
  { day: 'Wednesday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM1'], defaultRoom: 'LH-101' },
  { day: 'Wednesday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS3'], defaultRoom: 'Ground' },

  // THURSDAY
  { day: 'Thursday', startTime: '08:30', endTime: '10:20', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '10:40', endTime: '12:30', course: 'ADM', applicableBatches: ['ADM1', 'ADM2', 'ADM3', 'ADM4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '13:40', endTime: '14:35', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '14:35', endTime: '16:35', course: 'CLUB', applicableBatches: ['*'], defaultRoom: 'Auditorium / Clubs' },

  // FRIDAY
  { day: 'Friday', startTime: '08:30', endTime: '10:20', course: 'EDM', applicableBatches: ['EDM1', 'EDM2', 'EDM3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Friday', startTime: '08:30', endTime: '10:20', course: 'BS', applicableBatches: ['BS4'], defaultRoom: 'LH-405' },
  { day: 'Friday', startTime: '10:40', endTime: '12:30', course: 'LA', applicableBatches: ['LA3', 'LA4'], defaultRoom: 'LH-401/405' },
  { day: 'Friday', startTime: '10:40', endTime: '12:30', course: 'SSA', applicableBatches: ['SSA3', 'SSA4'], defaultRoom: 'LH-101/109' },
  { day: 'Friday', startTime: '13:40', endTime: '15:30', course: 'SSA', applicableBatches: ['SSA1', 'SSA2'], defaultRoom: 'LH-401/405' },
  { day: 'Friday', startTime: '13:40', endTime: '15:30', course: 'LA', applicableBatches: ['LA2'], defaultRoom: 'LH-109' },
  { day: 'Friday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM3'], defaultRoom: 'LH-401' },
  { day: 'Friday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS1'], defaultRoom: 'Ground' },

  // SATURDAY
  { day: 'Saturday', startTime: '08:30', endTime: '12:30', course: 'SSM', applicableBatches: ['SSM1', 'SSM2', 'SSM3', 'SSM4'], defaultRoom: 'ALPS TEAM' },
  { day: 'Saturday', startTime: '13:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM1', 'SSM2', 'SSM3', 'SSM4'], defaultRoom: 'ALPS TEAM' }
];

export interface StudentRecord {
  rollNo: string;
  batches: {
    MCOB: string;
    ADM: string;
    MC: string;
    SSM: string;
    BS: string;
    EDM: string;
    LA: string;
    SSA: string;
    SPORTS: string;
  };
}

export const STUDENT_REGISTRY: Record<string, StudentRecord> = ${JSON.stringify(students, null, 2)};

export const ALL_ROLL_NUMBERS = Object.keys(STUDENT_REGISTRY);

/**
 * Returns personalized timetable slots for any specific student roll number
 */
export function getTimetableForStudent(rollNo: string) {
  const student = STUDENT_REGISTRY[rollNo.toUpperCase()];
  if (!student) return [];

  const studentBatches = Object.values(student.batches).filter(b => b && b.trim() !== '');

  return MASTER_SCHEDULE.filter(slot => {
    if (slot.applicableBatches.includes('*')) return true;
    return slot.applicableBatches.some(b => studentBatches.includes(b));
  }).map((slot, index) => {
    const course = PSGIM_COURSES[slot.course];
    const studentBatch = student.batches[slot.course as keyof typeof student.batches];
    const groupNum = studentBatch ? parseInt(studentBatch.replace(/\\D/g, ''), 10) : 0;
    const facultyName = (groupNum && course?.faculty[groupNum]) || (course?.faculty[1] || 'Faculty');

    return {
      id: \`slot_\${rollNo}_\${slot.day}_\${index}\`,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      courseCode: course?.code || slot.course,
      courseTitle: course?.title || slot.course,
      shortForm: slot.course,
      batch: studentBatch || slot.applicableBatches[0],
      faculty: facultyName,
      room: slot.defaultRoom,
      color: course?.color || '#3B82F6'
    };
  });
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'psgimData.ts'), fileContent, 'utf8');
console.log('Successfully generated src/data/psgimData.ts with ' + Object.keys(students).length + ' students!');
