interface ZplTemplateParams {
  flowInstanceId: string;
  materiaPrima: string;
  numeroAmostra: string;
  lote: string;
  numeroNotaFiscal: string;
  fabricante: string;
  dataFabricacao: string;
  dataValidade: string;
  dataRecebimento: string;
  usina: string;
  safra: string;
  coletadoPor: string;
  observacoes: string;
  acompanhadoPor: string;
}

export const formatZplTemplate_REG_GQ_025_00 = (params: ZplTemplateParams): string => `
^XA

^PW799
^LL799
^CI28

^CF0,23
^FO40,30^FDETIQUETA DE^FS
^FO180,30^FDIDENTIFICACAO DE^FS
^FO40,55^FDAMOSTRA DE^FS
^FO180,55^FDMATERIA-PRIMA.^FS

^CF0,28
^FO580,50^FDID: ${params.flowInstanceId}^FS

^CF0,16
^FO35,110^FDMATERIA-PRIMA: ${params.materiaPrima}^FS
^FO310,110^FDNº AMOSTRA: ${params.numeroAmostra}^FS
^FO540,110^FDLOTE: ${params.lote}^FS

^FO35,150^FDNOTA FISCAL: ${params.numeroNotaFiscal}^FS
^FO310,150^FDFABRICANTE: ${params.fabricante}^FS

^FO35,190^FDFABRICACAO: ${params.dataFabricacao}^FS
^FO310,190^FDVALIDADE: ${params.dataValidade}^FS
^FO540,190^FDRECEBIMENTO: ${params.dataRecebimento}^FS

^FO35,230^FDUSINA: ${params.usina}^FS
^FO300,230^FDSAFRA: ${params.safra}^FS

^FO35,270^FDCOLETADO POR: ${params.coletadoPor}^FS
^FO35,310^FDOBSERVACOES: ${params.observacoes}^FS

^FO35,360^FDCOLETA ACOMPANHADA POR: ${params.acompanhadoPor}^FS

^XZ

`;
