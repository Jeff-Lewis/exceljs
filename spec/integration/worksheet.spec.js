'use strict';

var expect = require('chai').expect;
var _ = require('underscore');
var Excel = require('../../excel');
var Range = require('../../lib/doc/range');
var testutils = require('./../testutils');

describe('Worksheet', function() {
  describe('Values', function() {
    it('stores values properly', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      var now = new Date();

      // plain number
      ws.getCell('A1').value = 7;

      // simple string
      ws.getCell('B1').value = 'Hello, World!';

      // floating point
      ws.getCell('C1').value = 3.14;

      // 5 will be overwritten by the current date-time
      ws.getCell('D1').value = 5;
      ws.getCell('D1').value = now;

      // constructed string - will share recored with B1
      ws.getCell('E1').value = ['Hello', 'World'].join(', ') + '!';

      // hyperlink
      ws.getCell('F1').value = {text: 'www.google.com', hyperlink:'http://www.google.com'};

      // number formula
      ws.getCell('A2').value = {formula: 'A1', result: 7};

      // string formula
      ws.getCell('B2').value = {formula: 'CONCATENATE("Hello", ", ", "World!")', result: 'Hello, World!'};

      // date formula
      ws.getCell('C2').value = {formula: 'D1', result: now};

      expect(ws.getCell('A1').value).to.equal(7);
      expect(ws.getCell('B1').value).to.equal('Hello, World!');
      expect(ws.getCell('C1').value).to.equal(3.14);
      expect(ws.getCell('D1').value).to.equal(now);
      expect(ws.getCell('E1').value).to.equal('Hello, World!');
      expect(ws.getCell('F1').value.text).to.equal('www.google.com');
      expect(ws.getCell('F1').value.hyperlink).to.equal('http://www.google.com');

      expect(ws.getCell('A2').value.formula).to.equal('A1');
      expect(ws.getCell('A2').value.result).to.equal(7);

      expect(ws.getCell('B2').value.formula).to.equal('CONCATENATE("Hello", ", ", "World!")');
      expect(ws.getCell('B2').value.result).to.equal('Hello, World!');

      expect(ws.getCell('C2').value.formula).to.equal('D1');
      expect(ws.getCell('C2').value.result).to.equal(now);
    });

    it('stores shared string values properly', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.getCell('A1').value = 'Hello, World!';

      ws.getCell('A2').value = 'Hello';
      ws.getCell('B2').value = 'World';
      ws.getCell('C2').value = {formula: 'CONCATENATE(A2, ", ", B2, "!")', result: 'Hello, World!'};

      ws.getCell('A3').value = ['Hello', 'World'].join(', ') + '!';

      // A1 and A3 should reference the same string object
      expect(ws.getCell('A1').value).to.equal(ws.getCell('A3').value);

      // A1 and C2 should not reference the same object
      expect(ws.getCell('A1').value).to.equal(ws.getCell('C2').value.result);
    });

    it('assigns cell types properly', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // plain number
      ws.getCell('A1').value = 7;

      // simple string
      ws.getCell('B1').value = 'Hello, World!';

      // floating point
      ws.getCell('C1').value = 3.14;

      // date-time
      ws.getCell('D1').value = new Date();

      // hyperlink
      ws.getCell('E1').value = {text: 'www.google.com', hyperlink:'http://www.google.com'};

      // number formula
      ws.getCell('A2').value = {formula: 'A1', result: 7};

      // string formula
      ws.getCell('B2').value = {formula: 'CONCATENATE("Hello", ", ", "World!")', result: 'Hello, World!'};

      // date formula
      ws.getCell('C2').value = {formula: 'D1', result: new Date()};

      expect(ws.getCell('A1').type).to.equal(Excel.ValueType.Number);
      expect(ws.getCell('B1').type).to.equal(Excel.ValueType.String);
      expect(ws.getCell('C1').type).to.equal(Excel.ValueType.Number);
      expect(ws.getCell('D1').type).to.equal(Excel.ValueType.Date);
      expect(ws.getCell('E1').type).to.equal(Excel.ValueType.Hyperlink);

      expect(ws.getCell('A2').type).to.equal(Excel.ValueType.Formula);
      expect(ws.getCell('B2').type).to.equal(Excel.ValueType.Formula);
      expect(ws.getCell('C2').type).to.equal(Excel.ValueType.Formula);
    });

    it('adds columns', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.columns = [
        { key: 'id', width: 10 },
        { key: 'name', width: 32 },
        { key: 'dob', width: 10 }
      ];

      expect(ws.getColumn('id').number).to.equal(1);
      expect(ws.getColumn('id').width).to.equal(10);
      expect(ws.getColumn('A')).to.equal(ws.getColumn('id'));
      expect(ws.getColumn(1)).to.equal(ws.getColumn('id'));

      expect(ws.getColumn('name').number).to.equal(2);
      expect(ws.getColumn('name').width).to.equal(32);
      expect(ws.getColumn('B')).to.equal(ws.getColumn('name'));
      expect(ws.getColumn(2)).to.equal(ws.getColumn('name'));

      expect(ws.getColumn('dob').number).to.equal(3);
      expect(ws.getColumn('dob').width).to.equal(10);
      expect(ws.getColumn('C')).to.equal(ws.getColumn('dob'));
      expect(ws.getColumn(3)).to.equal(ws.getColumn('dob'));
    });

    it('adds column headers', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.columns = [
        { header: 'Id', width: 10 },
        { header: 'Name', width: 32 },
        { header: 'D.O.B.', width: 10 }
      ];

      expect(ws.getCell('A1').value).to.equal('Id');
      expect(ws.getCell('B1').value).to.equal('Name');
      expect(ws.getCell('C1').value).to.equal('D.O.B.');
    });

    it('adds column headers by number', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // by defn
      ws.getColumn(1).defn = { key: 'id', header: 'Id', width: 10 };

      // by property
      ws.getColumn(2).key = 'name';
      ws.getColumn(2).header = 'Name';
      ws.getColumn(2).width = 32;

      expect(ws.getCell('A1').value).to.equal('Id');
      expect(ws.getCell('B1').value).to.equal('Name');

      expect(ws.getColumn('A').key).to.equal('id');
      expect(ws.getColumn(1).key).to.equal('id');
      expect(ws.getColumn(1).header).to.equal('Id');
      expect(ws.getColumn(1).headers).to.deep.equal(['Id']);
      expect(ws.getColumn(1).width).to.equal(10);

      expect(ws.getColumn(2).key).to.equal('name');
      expect(ws.getColumn(2).header).to.equal('Name');
      expect(ws.getColumn(2).headers).to.deep.equal(['Name']);
      expect(ws.getColumn(2).width).to.equal(32);
    });

    it('adds column headers by letter', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // by defn
      ws.getColumn('A').defn = { key: 'id', header: 'Id', width: 10 };

      // by property
      ws.getColumn('B').key = 'name';
      ws.getColumn('B').header = 'Name';
      ws.getColumn('B').width = 32;

      expect(ws.getCell('A1').value).to.equal('Id');
      expect(ws.getCell('B1').value).to.equal('Name');

      expect(ws.getColumn('A').key).to.equal('id');
      expect(ws.getColumn(1).key).to.equal('id');
      expect(ws.getColumn('A').header).to.equal('Id');
      expect(ws.getColumn('A').headers).to.deep.equal(['Id']);
      expect(ws.getColumn('A').width).to.equal(10);

      expect(ws.getColumn('B').key).to.equal('name');
      expect(ws.getColumn('B').header).to.equal('Name');
      expect(ws.getColumn('B').headers).to.deep.equal(['Name']);
      expect(ws.getColumn('B').width).to.equal(32);
    });

    it('adds rows by object', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // add columns to define column keys
      ws.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 32 },
        { header: 'D.O.B.', key: 'dob', width: 10 }
      ];

      var dateValue1 = new Date(1970,1,1);
      var dateValue2 = new Date(1965,1,7);

      ws.addRow({id:1, name: 'John Doe', dob: dateValue1});
      ws.addRow({id:2, name: 'Jane Doe', dob: dateValue2});

      expect(ws.getCell('A2').value).to.equal(1);
      expect(ws.getCell('B2').value).to.equal('John Doe');
      expect(ws.getCell('C2').value).to.equal(dateValue1);

      expect(ws.getCell('A3').value).to.equal(2);
      expect(ws.getCell('B3').value).to.equal('Jane Doe');
      expect(ws.getCell('C3').value).to.equal(dateValue2);

      expect(ws.getRow(2).values).to.deep.equal([,1,'John Doe', dateValue1]);
      expect(ws.getRow(3).values).to.deep.equal([,2,'Jane Doe', dateValue2]);

      var values = [
        ,
        [, 'Id', 'Name', 'D.O.B.'],
        [, 1, 'John Doe', dateValue1],
        [, 2, 'Jane Doe', dateValue2]
      ];
      ws.eachRow(function(row, rowNumber) {
        expect(row.values).to.deep.equal(values[rowNumber]);
        row.eachCell(function(cell, colNumber) {
          expect(cell.value).to.equal(values[rowNumber][colNumber]);
        });
      });
    });

    it('adds rows by contiguous array', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      var dateValue1 = new Date(1970,1,1);
      var dateValue2 = new Date(1965,1,7);

      ws.addRow([1, 'John Doe', dateValue1]);
      ws.addRow([2, 'Jane Doe', dateValue2]);

      expect(ws.getCell('A1').value).to.equal(1);
      expect(ws.getCell('B1').value).to.equal('John Doe');
      expect(ws.getCell('C1').value).to.equal(dateValue1);

      expect(ws.getCell('A2').value).to.equal(2);
      expect(ws.getCell('B2').value).to.equal('Jane Doe');
      expect(ws.getCell('C2').value).to.equal(dateValue2);

      expect(ws.getRow(1).values).to.deep.equal([,1,'John Doe', dateValue1]);
      expect(ws.getRow(2).values).to.deep.equal([,2,'Jane Doe', dateValue2]);
    });

    it('adds rows by sparse array', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      var dateValue1 = new Date(1970,1,1);
      var dateValue2 = new Date(1965,1,7);
      var rows = [
        ,[,1, 'John Doe', ,dateValue1]
        ,[,2, 'Jane Doe', ,dateValue2]
      ];
      var row3 = [];
      row3[1] = 3;
      row3[3] = 'Sam';
      row3[5] = dateValue1;
      rows.push(row3);
      _.each(rows, function(row, index) {
        if (row) {
          ws.addRow(row);
        }
      });

      expect(ws.getCell('A1').value).to.equal(1);
      expect(ws.getCell('B1').value).to.equal('John Doe');
      expect(ws.getCell('D1').value).to.equal(dateValue1);

      expect(ws.getCell('A2').value).to.equal(2);
      expect(ws.getCell('B2').value).to.equal('Jane Doe');
      expect(ws.getCell('D2').value).to.equal(dateValue2);

      expect(ws.getCell('A3').value).to.equal(3);
      expect(ws.getCell('C3').value).to.equal('Sam');
      expect(ws.getCell('E3').value).to.equal(dateValue1);

      expect(ws.getRow(1).values).to.deep.equal(rows[1]);
      expect(ws.getRow(2).values).to.deep.equal(rows[2]);
      expect(ws.getRow(3).values).to.deep.equal(rows[3]);

      ws.eachRow(function(row, rowNumber) {
        expect(row.values).to.deep.equal(rows[rowNumber]);
        row.eachCell(function(cell, colNumber) {
          expect(cell.value).to.equal(rows[rowNumber][colNumber]);
        });
      });
    });

    it('iterates over rows', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.getCell('A1').value = 1;
      ws.getCell('B2').value = 2;
      ws.getCell('D4').value = 4;
      ws.getCell('F6').value = 6;
      ws.eachRow(function(row, rowNumber) {
        expect(rowNumber).not.to.equal(3);
        expect(rowNumber).not.to.equal(5);
      });

      var count = 1;
      ws.eachRow({includeEmpty: true}, function(row, rowNumber) {
        expect(rowNumber).to.equal(count++);
      });
    });

    it('iterates over collumn cells', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.getCell('A1').value = 1;
      ws.getCell('A2').value = 2;
      ws.getCell('A4').value = 4;
      ws.getCell('A6').value = 6;
      var colA = ws.getColumn('A');
      colA.eachCell(function(cell, rowNumber) {
        expect(rowNumber).not.to.equal(3);
        expect(rowNumber).not.to.equal(5);
        expect(cell.value).to.equal(rowNumber);
      });

      var count = 1;
      colA.eachCell({includeEmpty: true}, function(cell, rowNumber) {
        expect(rowNumber).to.equal(count++);
      });
      expect(count).to.equal(7);
    });
  });

  it('returns sheet values', function() {
    var wb = new Excel.Workbook();
    var ws = wb.addWorksheet();

    ws.getCell('A1').value = 11;
    ws.getCell('C1').value = 'C1';
    ws.getCell('A2').value = 21;
    ws.getCell('B2').value = 'B2';
    ws.getCell('A4').value = 'end';

    expect(ws.getSheetValues()).to.deep.equal([
      ,
      [,11,,'C1'],
      [,21,'B2'],
      ,
      [,'end']
    ]);
  });

  it('sets row styles', function() {
    var wb = new Excel.Workbook();
    var ws = wb.addWorksheet('basket');

    ws.getCell('A1').value = 5;
    ws.getCell('A1').numFmt = testutils.styles.numFmts.numFmt1;
    ws.getCell('A1').font = testutils.styles.fonts.arialBlackUI14;

    ws.getCell('C1').value = 'Hello, World!';
    ws.getCell('C1').alignment = testutils.styles.namedAlignments.bottomRight;
    ws.getCell('C1').border = testutils.styles.borders.doubleRed;
    ws.getCell('C1').fill = testutils.styles.fills.redDarkVertical;

    ws.getRow(1).numFmt = testutils.styles.numFmts.numFmt2;
    ws.getRow(1).font = testutils.styles.fonts.comicSansUdB16;
    ws.getRow(1).alignment = testutils.styles.namedAlignments.middleCentre;
    ws.getRow(1).border = testutils.styles.borders.thin;
    ws.getRow(1).fill = testutils.styles.fills.redGreenDarkTrellis;

    expect(ws.getCell('A1').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('A1').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('A1').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('A1').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('A1').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);

    expect(ws.findCell('B1')).to.be.undefined;

    expect(ws.getCell('C1').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('C1').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('C1').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('C1').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('C1').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);

    // when we 'get' the previously null cell, it should inherit the row styles
    expect(ws.getCell('B1').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('B1').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('B1').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('B1').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('B1').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);

  });

  it('sets col styles', function() {
    var wb = new Excel.Workbook();
    var ws = wb.addWorksheet('basket');

    ws.getCell('A1').value = 5;
    ws.getCell('A1').numFmt = testutils.styles.numFmts.numFmt1;
    ws.getCell('A1').font = testutils.styles.fonts.arialBlackUI14;

    ws.getCell('A3').value = 'Hello, World!';
    ws.getCell('A3').alignment = testutils.styles.namedAlignments.bottomRight;
    ws.getCell('A3').border = testutils.styles.borders.doubleRed;
    ws.getCell('A3').fill = testutils.styles.fills.redDarkVertical;

    ws.getColumn('A').numFmt = testutils.styles.numFmts.numFmt2;
    ws.getColumn('A').font = testutils.styles.fonts.comicSansUdB16;
    ws.getColumn('A').alignment = testutils.styles.namedAlignments.middleCentre;
    ws.getColumn('A').border = testutils.styles.borders.thin;
    ws.getColumn('A').fill = testutils.styles.fills.redGreenDarkTrellis;

    expect(ws.getCell('A1').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('A1').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('A1').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('A1').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('A1').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);

    expect(ws.findRow(2)).to.be.undefined;

    expect(ws.getCell('A3').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('A3').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('A3').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('A3').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('A3').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);

    // when we 'get' the previously null cell, it should inherit the column styles
    expect(ws.getCell('A2').numFmt).to.equal(testutils.styles.numFmts.numFmt2);
    expect(ws.getCell('A2').font).to.deep.equal(testutils.styles.fonts.comicSansUdB16);
    expect(ws.getCell('A2').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
    expect(ws.getCell('A2').border).to.deep.equal(testutils.styles.borders.thin);
    expect(ws.getCell('A2').fill).to.deep.equal(testutils.styles.fills.redGreenDarkTrellis);
  });

  it('puts the lotion in the basket', function() {
    var wb = new Excel.Workbook();
    var ws = wb.addWorksheet('basket');
    ws.getCell('A1').value = 'lotion';
  });

  describe('Merge Cells', function() {
    it('references the same top-left value', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // initial values
      ws.getCell('A1').value = 'A1';
      ws.getCell('B1').value = 'B1';
      ws.getCell('A2').value = 'A2';
      ws.getCell('B2').value = 'B2';

      ws.mergeCells('A1:B2');

      expect(ws.getCell('A1').value).to.equal('A1');
      expect(ws.getCell('B1').value).to.equal('A1');
      expect(ws.getCell('A2').value).to.equal('A1');
      expect(ws.getCell('B2').value).to.equal('A1');

      expect(ws.getCell('A1').type).to.equal(Excel.ValueType.String);
      expect(ws.getCell('B1').type).to.equal(Excel.ValueType.Merge);
      expect(ws.getCell('A2').type).to.equal(Excel.ValueType.Merge);
      expect(ws.getCell('B2').type).to.equal(Excel.ValueType.Merge);
    });

    it('does not allow overlapping merges', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.mergeCells('B2:C3');

      // intersect four corners
      expect(function() { ws.mergeCells('A1:B2'); }).to.throw(Error);
      expect(function() { ws.mergeCells('C1:D2'); }).to.throw(Error);
      expect(function() { ws.mergeCells('C3:D4'); }).to.throw(Error);
      expect(function() { ws.mergeCells('A3:B4'); }).to.throw(Error);

      // enclosing
      expect(function() { ws.mergeCells('A1:D4'); }).to.throw(Error);
    });

    it('merges and unmerges', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      var expectMaster = function(range, master) {
        var d = new Range(range);
        for (var i = d.top; i <= d.bottom; i++) {
          for (var j = d.left; j <= d.right; j++) {
            var cell = ws.getCell(i,j);
            var masterCell = master ? ws.getCell(master) : cell;
            expect(cell.master.address).to.equal(masterCell.address);
          }
        }
      };

      // merge some cells, then unmerge them
      ws.mergeCells('A1:B2');
      expectMaster('A1:B2', 'A1');
      ws.unMergeCells('A1:B2');
      expectMaster('A1:B2', null);

      // unmerge just one cell
      ws.mergeCells('A1:B2');
      expectMaster('A1:B2', 'A1');
      ws.unMergeCells('A1');
      expectMaster('A1:B2', null);

      ws.mergeCells('A1:B2');
      expectMaster('A1:B2', 'A1');
      ws.unMergeCells('B2');
      expectMaster('A1:B2', null);

      // build 4 merge-squares
      ws.mergeCells('A1:B2');
      ws.mergeCells('D1:E2');
      ws.mergeCells('A4:B5');
      ws.mergeCells('D4:E5');

      expectMaster('A1:B2', 'A1');
      expectMaster('D1:E2', 'D1');
      expectMaster('A4:B5', 'A4');
      expectMaster('D4:E5', 'D4');

      // unmerge the middle
      ws.unMergeCells('B2:D4');

      expectMaster('A1:B2', null);
      expectMaster('D1:E2', null);
      expectMaster('A4:B5', null);
      expectMaster('D4:E5', null);
    });

    it('does not allow overlapping merges', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      ws.mergeCells('B2:C3');

      // intersect four corners
      expect(function() { ws.mergeCells('A1:B2'); }).to.throw(Error);
      expect(function() { ws.mergeCells('C1:D2'); }).to.throw(Error);
      expect(function() { ws.mergeCells('C3:D4'); }).to.throw(Error);
      expect(function() { ws.mergeCells('A3:B4'); }).to.throw(Error);

      // enclosing
      expect(function() { ws.mergeCells('A1:D4'); }).to.throw(Error);
    });

    it('merges styles', function() {
      var wb = new Excel.Workbook();
      var ws = wb.addWorksheet('blort');

      // initial value
      var B2 = ws.getCell('B2');
      B2.value = 5;
      B2.style.font = testutils.styles.fonts.broadwayRedOutline20;
      B2.style.border = testutils.styles.borders.doubleRed;
      B2.style.fill = testutils.styles.fills.blueWhiteHGrad;
      B2.style.alignment = testutils.styles.namedAlignments.middleCentre;
      B2.style.numFmt = testutils.styles.numFmts.numFmt1;

      // expecting styles to be copied (see worksheet spec)
      ws.mergeCells('B2:C3');

      expect(ws.getCell('B2').font).to.deep.equal(testutils.styles.fonts.broadwayRedOutline20);
      expect(ws.getCell('B2').border).to.deep.equal(testutils.styles.borders.doubleRed);
      expect(ws.getCell('B2').fill).to.deep.equal(testutils.styles.fills.blueWhiteHGrad);
      expect(ws.getCell('B2').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
      expect(ws.getCell('B2').numFmt).to.equal(testutils.styles.numFmts.numFmt1);

      expect(ws.getCell('B3').font).to.deep.equal(testutils.styles.fonts.broadwayRedOutline20);
      expect(ws.getCell('B3').border).to.deep.equal(testutils.styles.borders.doubleRed);
      expect(ws.getCell('B3').fill).to.deep.equal(testutils.styles.fills.blueWhiteHGrad);
      expect(ws.getCell('B3').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
      expect(ws.getCell('B3').numFmt).to.equal(testutils.styles.numFmts.numFmt1);

      expect(ws.getCell('C2').font).to.deep.equal(testutils.styles.fonts.broadwayRedOutline20);
      expect(ws.getCell('C2').border).to.deep.equal(testutils.styles.borders.doubleRed);
      expect(ws.getCell('C2').fill).to.deep.equal(testutils.styles.fills.blueWhiteHGrad);
      expect(ws.getCell('C2').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
      expect(ws.getCell('C2').numFmt).to.equal(testutils.styles.numFmts.numFmt1);

      expect(ws.getCell('C3').font).to.deep.equal(testutils.styles.fonts.broadwayRedOutline20);
      expect(ws.getCell('C3').border).to.deep.equal(testutils.styles.borders.doubleRed);
      expect(ws.getCell('C3').fill).to.deep.equal(testutils.styles.fills.blueWhiteHGrad);
      expect(ws.getCell('C3').alignment).to.deep.equal(testutils.styles.namedAlignments.middleCentre);
      expect(ws.getCell('C3').numFmt).to.equal(testutils.styles.numFmts.numFmt1);
    });
  });
});
