// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the openzepplin contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Motyf is ERC721, Ownable {
    using Strings for uint256;

    string _baseTokenURI;

    uint256 public tokenIds = 0;

    uint256 public maxTokenIds;

    constructor (
        string memory baseURI,
        uint256 _maxTokenIds,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        maxTokenIds = _maxTokenIds;
    }

    function mint(address to) public onlyOwner {
        require(tokenIds < maxTokenIds, "Exceeded maximum token supply");
        tokenIds += 1;
        _safeMint(to, tokenIds);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyOwner {
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyOwner {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override onlyOwner {
        _safeTransfer(from, to, tokenId, data);
    }

    function bulkTransfer(
        address from,
        address to,
        uint256[] calldata transferTokenIds
    ) external onlyOwner {
        for (uint256 i; i < transferTokenIds.length;) {
            _safeTransfer(from, to, transferTokenIds[i], "");
            unchecked { i++; }
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override onlyOwner {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}